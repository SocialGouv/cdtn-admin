"""Monthly page-views per contribution: générique vs. summed personnalisées.

For **every** contribution listed on code.travail.gouv.fr (enumerated from the
public sitemap), build two monthly view series from Matomo over a date range:

* **générique** — views of the single generic page ``/contribution/{slug}``
* **perso (Σ CC)** — the summed views of every per-convention-collective page

Personalized pages are matched across the slug migration — both the flat scheme
``/contribution/{idcc}-{slug}`` and the nested scheme
``/contribution/{slug}/{idcc}[-{cc}]`` count toward the same contribution.

The default range is January → June 2026, one bucket per calendar month, plus a
cumulative total over the whole range.

Run it (``--demo`` needs neither credentials nor network; the live form reads the
``MATOMO_*`` settings from ``.env`` and fetches the sitemap over HTTPS)::

    uv run python -m analysis.reports.contrib_monthly_views --demo
    uv run python -m analysis.reports.contrib_monthly_views \
        --start 2026-01-01 --end 2026-06-30

Outputs one wide CSV (one row per contribution: ``{YYYY-MM}_generic`` /
``{YYYY-MM}_perso`` columns for each month plus ``cumul_generic`` /
``cumul_perso`` / ``cumul_total``, sorted by total desc) and a top-N stacked-bar
PNG under ``--out`` (default ``analysis/output/``).

Note: a couple of slugs exist on the site only in personalized form (slug-migration
leftovers with no generic page, e.g. ``indemnites-depart-a-la-retraite``); their
views map to no enumerated generic contribution and are ignored. Add a slug-alias
map here if that ever needs to be captured.
"""

from __future__ import annotations

import argparse
import pickle
import re
import time
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import httpx
import matplotlib.pyplot as plt
import pandas as pd

# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #
SITEMAP_URL = "https://code.travail.gouv.fr/sitemap.xml"
# Default sitemap namespace (sitemaps.org 0.9); ElementTree tags are namespaced.
_SITEMAP_NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"

_CONTRIB_PREFIX = "/contribution/"
# A generic contribution URL is a single path segment under /contribution/ that
# does NOT start with an "{idcc}-" numeric prefix (which marks a flat perso page).
_GENERIC_PATH_RE = re.compile(r"^/contribution/(?!\d+-)([^/]+)/?$")
# Flat personalized scheme, once the /contribution/ prefix is stripped: {idcc}-{slug}.
_FLAT_PERSO_RE = re.compile(r"^\d+-(.+)$")

# Matomo metric field -> human name. "views" = pageviews (nb_hits); the user asked
# for "vues", so that is the default; visits (nb_visits) is available via --metric.
METRICS: dict[str, tuple[str, str]] = {
    "views": ("nb_hits", "Vues (pageviews)"),
    "visits": ("nb_visits", "Visites"),
}

# Chart chrome (dataviz "Chart chrome & ink", light surface).
INK = "#0b0b0b"
MUTED = "#898781"
GRID = "#e1e0d9"
GENERIC_COLOR = "#2a78d6"  # blue (dataviz slot 1)
PERSO_COLOR = "#e34948"  # red  (dataviz diverging pole)


# --------------------------------------------------------------------------- #
# Sitemap -> generic contribution slugs
# --------------------------------------------------------------------------- #
def _parse_generic_slugs(xml_bytes: bytes) -> list[str]:
    """Extract the sorted set of generic contribution slugs from sitemap XML.

    Keeps only ``/contribution/{slug}`` locs (single segment, no ``{idcc}-``
    prefix) — the per-CC personalized URLs are matched later against Matomo rows.
    """
    root = ET.fromstring(xml_bytes)
    slugs: set[str] = set()
    for loc in root.iter(f"{_SITEMAP_NS}loc"):
        text = (loc.text or "").strip()
        if not text:
            continue
        match = _GENERIC_PATH_RE.match(urlsplit(text).path)
        if match:
            slugs.add(match.group(1))
    return sorted(slugs)


def fetch_generic_slugs(url: str = SITEMAP_URL, *, timeout: float = 30.0) -> list[str]:
    """Fetch the public sitemap and return the sorted generic contribution slugs."""
    print(f"⏳ Sitemap: {url}", flush=True)
    response = httpx.get(url, timeout=timeout, follow_redirects=True)
    response.raise_for_status()
    slugs = _parse_generic_slugs(response.content)
    print(f"✓ {len(slugs)} contributions génériques", flush=True)
    return slugs


# --------------------------------------------------------------------------- #
# URL matching
# --------------------------------------------------------------------------- #
def _normalize_path(row: dict[str, Any]) -> str | None:
    """Extract a clean ``/contribution/...`` path from a Matomo page-URL row.

    Strips scheme/host, query string and fragment; guarantees a leading slash.
    """
    raw = row.get("url") or row.get("label") or ""
    if not raw:
        return None
    path = urlsplit(raw).path  # drops ?query and #fragment; host if absolute
    if not path.startswith("/"):
        path = "/" + path
    return path or None


def classify(path: str, known: frozenset[str]) -> tuple[str, str] | None:
    """Map a normalized path to ``(slug, "generic"|"perso")`` or ``None``.

    Handles both personalized schemes — nested ``/contribution/{slug}/{idcc}`` and
    flat ``/contribution/{idcc}-{slug}`` — resolving each to its generic ``slug``.
    ``known`` is the set of generic slugs; a path whose slug is not known returns
    ``None`` (an unrelated page, or a slug with no generic counterpart).
    """
    if not path.startswith(_CONTRIB_PREFIX):
        return None
    rest = path[len(_CONTRIB_PREFIX) :].strip("/")
    if not rest:
        return None
    if "/" in rest:  # nested perso: /contribution/{slug}/{idcc}[-{cc}]
        slug = rest.split("/", 1)[0]
        return (slug, "perso") if slug in known else None
    if rest in known:  # /contribution/{slug}
        return (rest, "generic")
    flat = _FLAT_PERSO_RE.match(rest)  # /contribution/{idcc}-{slug}
    if flat and flat.group(1) in known:
        return (flat.group(1), "perso")
    return None


def _to_number(value: Any) -> float:
    """Matomo metrics arrive as int or numeric string; coerce, defaulting to 0."""
    if value is None:
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


# --------------------------------------------------------------------------- #
# Aggregation
# --------------------------------------------------------------------------- #
def _month_key(period_label: str) -> str:
    """Matomo month label -> ``"YYYY-MM"``.

    Robust to a range label (``"2026-01-01,2026-01-31"``) and a plain month
    (``"2026-01"``): take the pre-comma start and keep its year-month prefix.
    """
    return period_label.split(",", 1)[0][:7]


def aggregate_months(
    months: dict[str, list[dict[str, Any]]],
    metric_field: str,
    slugs: list[str],
) -> pd.DataFrame:
    """Fold raw monthly page-URL rows into one wide row per contribution.

    Every slug gets a row (contributions with no views appear with zeros). Columns
    are ``{YYYY-MM}_generic`` / ``{YYYY-MM}_perso`` for each month present, plus
    ``cumul_generic`` / ``cumul_perso`` / ``cumul_total`` over the range. Rows are
    indexed by slug and sorted by ``cumul_total`` descending.
    """
    known = frozenset(slugs)
    month_keys = sorted({_month_key(label) for label in months})
    # slug -> month_key -> {"generic": float, "perso": float}, pre-seeded to zero
    # so contributions without any traffic still get a full row.
    totals: dict[str, dict[str, dict[str, float]]] = {
        slug: {mk: {"generic": 0.0, "perso": 0.0} for mk in month_keys}
        for slug in slugs
    }

    for label, rows in months.items():
        month_key = _month_key(label)
        for row in rows:
            path = _normalize_path(row)
            if path is None:
                continue
            matched = classify(path, known)
            if matched is None:
                continue
            slug, bucket = matched
            totals[slug][month_key][bucket] += _to_number(row.get(metric_field))

    records: list[dict[str, Any]] = []
    for slug in slugs:
        record: dict[str, Any] = {"slug": slug}
        cumul_generic = 0.0
        cumul_perso = 0.0
        for mk in month_keys:
            generic = totals[slug][mk]["generic"]
            perso = totals[slug][mk]["perso"]
            record[f"{mk}_generic"] = round(generic)
            record[f"{mk}_perso"] = round(perso)
            cumul_generic += generic
            cumul_perso += perso
        record["cumul_generic"] = round(cumul_generic)
        record["cumul_perso"] = round(cumul_perso)
        record["cumul_total"] = round(cumul_generic + cumul_perso)
        records.append(record)

    df = pd.DataFrame(records).set_index("slug")
    return df.sort_values("cumul_total", ascending=False)


# --------------------------------------------------------------------------- #
# Data sources
# --------------------------------------------------------------------------- #
def _cache_path(start: str, end: str) -> Path:
    cache_dir = Path(__file__).resolve().parents[3] / "output" / ".cache"
    return cache_dir / f"pageurls_month_{start}_{end}.pkl"


def fetch_live_months(
    start: str, end: str, *, use_cache: bool = True
) -> dict[str, list[dict[str, Any]]]:
    """Pull the monthly page-URL reports from the Matomo Reporting API (cached).

    A single request returns one flat page-URL bucket per calendar month in the
    range. The raw result is cached to disk keyed by the date range, so tweaking
    the metric or the chart afterwards is instant. Pass ``use_cache=False`` to
    force a fresh pull.
    """
    # Imported lazily so --demo works without httpx creds / network configured.
    from analysis.connectors.matomo_reporting import MatomoReportingConnector

    cache = _cache_path(start, end)
    if use_cache and cache.exists():
        print(f"• Cache Matomo: {cache.name}", flush=True)
        with cache.open("rb") as handle:
            return pickle.load(handle)

    print(f"⏳ Appel Matomo {start} → {end} (par mois) …", flush=True)
    t0 = time.perf_counter()
    with MatomoReportingConnector() as matomo:
        # Only page paths containing "contribution" cross the wire (server-side
        # filter); every URL we count lives under /contribution/.
        months = matomo.get_page_urls(
            start, end, period="month", label_pattern="contribution"
        )
    print(f"✓ {len(months)} mois reçus en {time.perf_counter() - t0:.0f}s", flush=True)

    if use_cache:
        cache.parent.mkdir(parents=True, exist_ok=True)
        with cache.open("wb") as handle:
            pickle.dump(months, handle)
    return months


DEMO_SLUGS: tuple[str, ...] = (
    "les-conges-pour-evenements-familiaux",
    "a-quelles-indemnites-peut-pretendre-un-salarie-qui-part-a-la-retraite",
    "quelles-sont-les-durees-du-preavis-de-demission",
    "quelle-est-la-duree-de-la-periode-dessai",
    "quel-est-le-salaire-minimum",
    "une-contribution-sans-aucune-vue",  # kept traffic-free -> proves the zero-fill
)


def build_demo_data() -> tuple[list[str], dict[str, list[dict[str, Any]]]]:
    """Synthesize six monthly page-URL buckets in BOTH URL schemes (no network).

    Deterministic (no RNG). Generic traffic erodes month over month while per-CC
    pages grow, and the URL scheme flips flat -> nested mid-range — exercising the
    exact matching path used on live data. Returns ``(slugs, months)`` so ``--demo``
    needs neither the sitemap nor Matomo credentials.
    """
    demo_idccs = [1090, 1517, 2098, 3248, 787, 1596]  # a handful of CCs
    scheme_flip = 3  # month index (0-based) where flat -> nested
    trafficked = DEMO_SLUGS[:-1]  # every slug but the deliberate zero-view one
    # Per slug: (generic month-1 peak, perso month-1 base).
    base = {slug: (2600 - 380 * i, 600 + 220 * i) for i, slug in enumerate(trafficked)}

    months: dict[str, list[dict[str, Any]]] = {}
    for m in range(1, 7):
        label = f"2026-{m:02d}-01,2026-{m:02d}-28"
        t = (m - 1) / 5  # 0..1 progress across the range
        nested = (m - 1) >= scheme_flip
        rows: list[dict[str, Any]] = []
        for slug, (g0, p0) in base.items():
            generic = g0 * (0.55 + 0.45 * (1 - t))  # erodes towards 55% of the peak
            rows.append(
                {
                    "label": f"/contribution/{slug}",
                    "nb_hits": round(generic),
                    "nb_visits": round(generic * 0.82),
                }
            )
            per_cc = p0 * (0.4 + 0.6 * t) / len(demo_idccs)  # grows with the rollout
            for idcc in demo_idccs:
                if nested:
                    path = f"/contribution/{slug}/{idcc}-convention-{idcc}"
                else:
                    path = f"/contribution/{idcc}-{slug}"
                rows.append(
                    {
                        "label": path,
                        "nb_hits": round(per_cc),
                        "nb_visits": round(per_cc * 0.85),
                    }
                )
        # Noise the filter / classifier must ignore.
        rows.append({"label": "/contribution/9999-slug-inconnu", "nb_hits": 480})
        rows.append({"label": "/fiche-service-public/autre", "nb_hits": 900})
        months[label] = rows
    return list(DEMO_SLUGS), months


# --------------------------------------------------------------------------- #
# Outputs
# --------------------------------------------------------------------------- #
def write_csv(df: pd.DataFrame, path: Path) -> None:
    """Write the wide per-contribution table to ``path`` (slug in the index)."""
    df.to_csv(path)


def _style_axis(ax: plt.Axes) -> None:
    ax.grid(True, axis="x", color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    for spine in ("left", "bottom"):
        ax.spines[spine].set_color(MUTED)
    ax.tick_params(colors=MUTED, labelsize=9)


def build_top_chart(
    df: pd.DataFrame,
    metric_label: str,
    out_path: Path,
    top_n: int = 15,
) -> None:
    """Horizontal stacked bars — top-N contributions by total views over the range.

    Each bar splits générique (blue) vs perso Σ CC (red); the two validated hues
    encode the role. Contributions are ordered by ``cumul_total`` descending.
    """
    top = df.head(top_n).iloc[::-1]  # reverse so the largest sits at the top
    labels = [s if len(s) <= 42 else s[:39] + "…" for s in top.index]
    generic = top["cumul_generic"]
    perso = top["cumul_perso"]

    height = max(4.0, 0.45 * len(top) + 1.5)
    fig, ax = plt.subplots(figsize=(12, height), constrained_layout=True)
    ax.barh(labels, generic, color=GENERIC_COLOR, label="générique")
    ax.barh(labels, perso, left=generic, color=PERSO_COLOR, label="perso (Σ CC)")
    ax.set_title(
        f"Top {len(top)} contributions — {metric_label} cumulées (générique + perso)",
        color=INK,
        fontsize=13,
        loc="left",
    )
    ax.set_xlabel(metric_label, color=MUTED, fontsize=10)
    ax.legend(frameon=False, fontsize=9, loc="lower right")
    _style_axis(ax)
    fig.savefig(out_path, dpi=130)
    plt.close(fig)


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start", default="2026-01-01", help="range start YYYY-MM-DD")
    parser.add_argument("--end", default="2026-06-30", help="range end YYYY-MM-DD")
    parser.add_argument(
        "--metric",
        choices=sorted(METRICS),
        default="views",
        help="views = pageviews (nb_hits, default); visits = nb_visits",
    )
    parser.add_argument(
        "--top", type=int, default=15, help="number of contributions in the chart"
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="run on synthetic data, no Matomo credentials nor network needed",
    )
    parser.add_argument(
        "--refresh",
        action="store_true",
        help="bypass the on-disk cache and re-pull from Matomo",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path(__file__).resolve().parents[3] / "output",
        help="output directory for the PNG and CSV",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> None:
    # CLI is headless: render straight to a file, never try to open a GUI window.
    # (Left unset at import so charts render inline when used from a notebook.)
    plt.switch_backend("Agg")

    args = _parse_args(argv)
    metric_field, metric_label = METRICS[args.metric]

    if args.demo:
        print("• Source: synthetic demo data (no Matomo call, no sitemap)")
        slugs, months = build_demo_data()
    else:
        print(f"• Source: sitemap + Matomo Reporting API  {args.start} → {args.end}")
        slugs = fetch_generic_slugs()
        months = fetch_live_months(args.start, args.end, use_cache=not args.refresh)

    df = aggregate_months(months, metric_field, slugs)
    if df.empty:
        raise SystemExit("No contributions found — check the sitemap and range.")

    args.out.mkdir(parents=True, exist_ok=True)
    suffix = "demo" if args.demo else args.metric
    csv_path = args.out / f"contrib_monthly_{suffix}.csv"
    png_path = args.out / f"contrib_monthly_{suffix}.png"

    write_csv(df, csv_path)
    build_top_chart(df, metric_label, png_path, top_n=args.top)

    total_generic = int(df["cumul_generic"].sum())
    total_perso = int(df["cumul_perso"].sum())
    with pd.option_context(
        "display.max_rows", None, "display.width", None, "display.max_columns", None
    ):
        header = (
            f"{len(df)} contributions — {metric_label} cumulées "
            f"{args.start[:7]} → {args.end[:7]}"
        )
        print(f"\n{header}")
        print(
            f"générique {total_generic} · perso Σ {total_perso} · "
            f"total {total_generic + total_perso}"
        )
        print(f"\nTop {args.top} par vues cumulées :")
        print(df.head(args.top).to_string())
    print(f"\n✓ CSV   : {csv_path}")
    print(f"✓ Chart : {png_path}")


if __name__ == "__main__":
    main()
