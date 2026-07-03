"""Weekly page-views: générique vs. summed personalized contribution URLs.

For each configured contribution we build two weekly series from Matomo:

* **générique** — views of the single generic page ``/contribution/{slug}``
* **perso (Σ CC)** — the summed views of *every* per-convention-collective page

Personalized pages are matched across the slug migration so the series stays
continuous. Two URL schemes are summed together (see :func:`_build_patterns`):

* flat / old:   ``/contribution/{idcc}-{slug}``
  (e.g. ``/contribution/3248-a-quelles-...-retraite``)
* nested / new: ``/contribution/{slug}/{idcc}-{cc-name}``
  (e.g. ``/contribution/les-conges-.../3248-metallurgie``)

Run it (``--demo`` needs no credentials; the live form reads ``MATOMO_*`` from
``.env``)::

    uv run python -m analysis.reports.contrib_weekly_views --demo
    uv run python -m analysis.reports.contrib_weekly_views \
        --start 2024-09-01 --end 2026-07-01

Outputs a three-panel PNG (absolute weekly views, indexed-to-peak declines, and
the congés-vs-retraite relative gap) plus CSVs (raw weekly, ``_semaine``
week-over-week, ``_ecart`` relative gap) under ``--out`` (default
``analysis/output/``), and prints the decline + relative comparison tables.
"""

from __future__ import annotations

import argparse
import pickle
import re
import time
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit

import matplotlib.pyplot as plt
import pandas as pd


# --------------------------------------------------------------------------- #
# Configuration
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class Contribution:
    """One CDTN contribution to track, identified by its *générique* slug."""

    key: str  # short id, used in column names and the CLI
    label: str  # human label for the chart legend
    generic_slug: str  # slug of the idcc="0000" générique page
    color: str  # categorical hue (validated blue / red pair)


CONTRIBUTIONS: tuple[Contribution, ...] = (
    Contribution(
        key="retraite",
        label="Indemnités départ à la retraite",
        generic_slug=(
            "a-quelles-indemnites-peut-pretendre-un-salarie-qui-part-a-la-retraite"
        ),
        color="#2a78d6",  # blue  (dataviz slot 1)
    ),
    Contribution(
        key="conges",
        label="Congés pour événements familiaux",
        generic_slug="les-conges-pour-evenements-familiaux",
        color="#e34948",  # red   (dataviz diverging pole)
    ),
)

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


# --------------------------------------------------------------------------- #
# URL matching
# --------------------------------------------------------------------------- #
@dataclass(frozen=True)
class SlugPatterns:
    generic: re.Pattern[str]
    perso_flat: re.Pattern[str]
    perso_nested: re.Pattern[str]


def _build_patterns(slug: str) -> SlugPatterns:
    """Compile the generic / flat-perso / nested-perso path matchers for a slug."""
    s = re.escape(slug)
    return SlugPatterns(
        # /contribution/{slug}
        generic=re.compile(rf"^/contribution/{s}/?$", re.IGNORECASE),
        # /contribution/{idcc}-{slug}         (old flat scheme)
        perso_flat=re.compile(rf"^/contribution/\d+-{s}/?$", re.IGNORECASE),
        # /contribution/{slug}/{idcc}-{cc}    (new nested scheme)
        perso_nested=re.compile(rf"^/contribution/{s}/\d+-[^/]+/?$", re.IGNORECASE),
    )


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


def _classify(path: str, patterns: SlugPatterns) -> str | None:
    """Return ``"generic"``, ``"perso"`` or ``None`` for a normalized path."""
    if patterns.generic.match(path):
        return "generic"
    if patterns.perso_flat.match(path) or patterns.perso_nested.match(path):
        return "perso"
    return None


# --------------------------------------------------------------------------- #
# Aggregation
# --------------------------------------------------------------------------- #
def _to_number(value: Any) -> float:
    """Matomo metrics arrive as int or numeric string; coerce, defaulting to 0."""
    if value is None:
        return 0.0
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _week_start(week_label: str) -> date:
    """Parse a Matomo week label ``"2025-01-06,2025-01-12"`` to its start date."""
    start = week_label.split(",", 1)[0]
    return datetime.strptime(start, "%Y-%m-%d").date()


def aggregate_weeks(
    weeks: dict[str, list[dict[str, Any]]],
    metric_field: str,
    contributions: tuple[Contribution, ...] = CONTRIBUTIONS,
) -> pd.DataFrame:
    """Fold the raw per-week page-URL rows into one row per week per contribution.

    Returns a DataFrame indexed by week-start date with, per contribution,
    ``{key}_generic`` and ``{key}_perso`` columns (summed ``metric_field``).
    """
    patterns = {c.key: _build_patterns(c.generic_slug) for c in contributions}
    records: list[dict[str, Any]] = []

    for week_label, rows in weeks.items():
        totals = {c.key: {"generic": 0.0, "perso": 0.0} for c in contributions}
        for row in rows:
            path = _normalize_path(row)
            if not path or not path.startswith("/contribution/"):
                continue
            value = _to_number(row.get(metric_field))
            for c in contributions:
                bucket = _classify(path, patterns[c.key])
                if bucket is not None:
                    totals[c.key][bucket] += value
                    break  # a path belongs to at most one contribution

        record: dict[str, Any] = {"week": _week_start(week_label)}
        for c in contributions:
            record[f"{c.key}_generic"] = totals[c.key]["generic"]
            record[f"{c.key}_perso"] = totals[c.key]["perso"]
        records.append(record)

    df = pd.DataFrame(records)
    if df.empty:
        return df
    return df.sort_values("week").reset_index(drop=True)


# --------------------------------------------------------------------------- #
# Reporting: chart + decline comparison
# --------------------------------------------------------------------------- #
def _series_specs(
    contributions: tuple[Contribution, ...],
) -> list[tuple[str, str, str, str]]:
    """(column, legend label, color, linestyle) for every plotted series.

    Hue encodes the contribution; linestyle encodes the role (solid=générique,
    dashed=perso) — a composite encoding that keeps us to two validated hues.
    """
    specs: list[tuple[str, str, str, str]] = []
    for c in contributions:
        specs.append((f"{c.key}_generic", f"{c.label} — générique", c.color, "-"))
        specs.append((f"{c.key}_perso", f"{c.label} — perso (Σ CC)", c.color, "--"))
    return specs


def _style_axis(ax: plt.Axes) -> None:
    ax.grid(True, color=GRID, linewidth=0.8)
    ax.set_axisbelow(True)
    for spine in ("top", "right"):
        ax.spines[spine].set_visible(False)
    for spine in ("left", "bottom"):
        ax.spines[spine].set_color(MUTED)
    ax.tick_params(colors=MUTED, labelsize=9)


def build_chart(
    df: pd.DataFrame,
    metric_label: str,
    out_path: Path,
    contributions: tuple[Contribution, ...] = CONTRIBUTIONS,
) -> None:
    """Render a three-panel chart: absolute weekly views, indexed-to-peak, and
    the relative gap between the two contributions."""
    specs = _series_specs(contributions)
    fig, (ax_abs, ax_idx, ax_gap) = plt.subplots(
        3,
        1,
        figsize=(14, 14),
        sharex=True,
        constrained_layout=True,
        height_ratios=[3, 3, 2],
    )

    # Panel 1 — absolute weekly views.
    for col, label, color, ls in specs:
        ax_abs.plot(df["week"], df[col], ls, color=color, linewidth=2, label=label)
    ax_abs.set_title(
        "Vues par semaine — générique vs. personnalisées (Σ conventions collectives)",
        color=INK,
        fontsize=13,
        loc="left",
    )
    ax_abs.set_ylabel(f"{metric_label} / semaine", color=MUTED, fontsize=10)
    ax_abs.set_ylim(bottom=0)
    ax_abs.legend(frameon=False, fontsize=9, ncol=2, loc="upper right")
    _style_axis(ax_abs)

    # Panel 2 — each series indexed to 100 at its OWN peak, so a decline reads
    # directly as "% of peak" and the two contributions' drops are comparable
    # regardless of absolute traffic (a rising series simply climbs toward 100).
    for col, label, color, ls in specs:
        peak = df[col].max()
        if not peak:
            continue
        ax_idx.plot(
            df["week"],
            df[col] / peak * 100.0,
            ls,
            color=color,
            linewidth=2,
            label=label,
        )
    ax_idx.axhline(100, color=MUTED, linewidth=0.8, linestyle=":")
    ax_idx.set_title(
        "Indexé à 100 au pic de chaque série — comparaison des baisses (% du pic)",
        color=INK,
        fontsize=13,
        loc="left",
    )
    ax_idx.set_ylabel("% du pic", color=MUTED, fontsize=10)
    ax_idx.set_ylim(0, 110)
    _style_axis(ax_idx)

    # Panel 3 — relative gap: the two contributions' totals share a base-100
    # index at the first week, and this is the % by which the target sits above
    # (>0, green) or below (<0, red) the reference. It isolates whether the
    # change on the target contribution helps or hurts vs. the comparison one.
    ref, target = contributions[0], contributions[1]
    rel = relative_comparison(df, contributions)
    gap = rel["écart %"]
    ax_gap.plot(rel["semaine"], gap, color="#4a3aa7", linewidth=2)
    ax_gap.axhline(0, color=MUTED, linewidth=0.8, linestyle=":")
    ax_gap.fill_between(
        rel["semaine"], gap, 0, where=gap >= 0, alpha=0.12, color="#1baf7a"
    )
    ax_gap.fill_between(
        rel["semaine"], gap, 0, where=gap < 0, alpha=0.12, color="#e34948"
    )
    ax_gap.set_title(
        f"Écart {target.key} vs {ref.key} (total, base 100 à la 1re semaine) — "
        f"% · >0 = {target.key} tient mieux",
        color=INK,
        fontsize=13,
        loc="left",
    )
    ax_gap.set_ylabel("écart %", color=MUTED, fontsize=10)
    _style_axis(ax_gap)

    fig.savefig(out_path, dpi=130)
    plt.close(fig)


def decline_table(
    df: pd.DataFrame,
    contributions: tuple[Contribution, ...] = CONTRIBUTIONS,
) -> pd.DataFrame:
    """Peak → latest decline per series (and per-contribution total)."""
    rows: list[dict[str, Any]] = []
    columns: list[tuple[str, str]] = []
    for c in contributions:
        columns.append((f"{c.label} — générique", f"{c.key}_generic"))
        columns.append((f"{c.label} — perso (Σ CC)", f"{c.key}_perso"))

    latest_week = df["week"].iloc[-1]
    for name, col in columns:
        series = df[col]
        peak = series.max()
        peak_week = df["week"].iloc[series.values.argmax()]
        latest = series.iloc[-1]
        drop_pct = (1 - latest / peak) * 100 if peak else 0.0
        rows.append(
            {
                "série": name,
                "pic": round(peak),
                "semaine du pic": peak_week,
                f"dernière ({latest_week})": round(latest),
                "baisse pic→dernière": f"-{drop_pct:.0f}%",
            }
        )
    return pd.DataFrame(rows)


def weekly_comparison(
    df: pd.DataFrame,
    contributions: tuple[Contribution, ...] = CONTRIBUTIONS,
) -> pd.DataFrame:
    """Week-by-week table, one row per week.

    Per contribution: générique, perso (Σ CC) and total views, plus the
    week-over-week variation of the total (``Δ%/sem``) — so the declines can be
    read and compared week by week rather than only peak → latest.
    """
    out = pd.DataFrame({"semaine": df["week"]})
    for c in contributions:
        g = df[f"{c.key}_generic"].round().astype(int)
        p = df[f"{c.key}_perso"].round().astype(int)
        total = g + p
        out[f"{c.key} générique"] = g
        out[f"{c.key} perso Σ"] = p
        out[f"{c.key} total"] = total
        out[f"{c.key} Δ%/sem"] = (total.pct_change() * 100).round(1)
    return out


def _total(df: pd.DataFrame, c: Contribution) -> pd.Series:
    """Total weekly views (générique + perso Σ CC) for one contribution."""
    return df[f"{c.key}_generic"] + df[f"{c.key}_perso"]


def _index_100(series: pd.Series) -> pd.Series:
    """Index a series to 100 at its first non-zero week (common baseline)."""
    base = next((v for v in series if v > 0), None) or 1.0
    return series / base * 100.0


def relative_comparison(
    df: pd.DataFrame,
    contributions: tuple[Contribution, ...] = CONTRIBUTIONS,
) -> pd.DataFrame:
    """Compare the two contributions' TOTAL views on a common base-100 index.

    Each total (générique + perso Σ CC) is indexed to 100 at the first week, so
    both start level and the gap isolates *relative* performance rather than raw
    volume. ``écart %`` = how much the 2nd contribution (target, e.g. congés) is
    above/below the 1st (reference, e.g. retraite) versus that shared baseline:
    a growing negative gap means the target loses audience faster — i.e. the
    change on it under-performs the reference.
    """
    ref, target = contributions[0], contributions[1]
    ref_idx = _index_100(_total(df, ref))
    tgt_idx = _index_100(_total(df, target))
    return pd.DataFrame(
        {
            "semaine": df["week"],
            f"{ref.key} idx100": ref_idx.round(1),
            f"{target.key} idx100": tgt_idx.round(1),
            "écart pts": (tgt_idx - ref_idx).round(1),
            "écart %": (tgt_idx / ref_idx * 100 - 100).round(1),
        }
    )


def comparison_summary(
    df: pd.DataFrame,
    contributions: tuple[Contribution, ...] = CONTRIBUTIONS,
) -> pd.DataFrame:
    """Headline per-contribution total decline + the difference between the two.

    The last row is the gap in peak→latest decline (target − reference): the
    single number answering "are the changes on the target relevant?".
    """
    rows: list[dict[str, Any]] = []
    declines: dict[str, float] = {}
    for c in contributions:
        total = _total(df, c)
        first = next((v for v in total if v > 0), total.iloc[0])
        peak = total.max()
        latest = total.iloc[-1]
        peak_drop = (1 - latest / peak) * 100 if peak else 0.0
        declines[c.key] = peak_drop
        rows.append(
            {
                "contribution": c.label,
                "total 1re sem": round(first),
                "total pic": round(peak),
                "total dernière": round(latest),
                "baisse pic→dernière": f"-{peak_drop:.0f}%",
                "évol. 1re→dernière": f"{(latest / first - 1) * 100:+.0f}%"
                if first
                else "n/a",
            }
        )
    ref, target = contributions[0], contributions[1]
    gap = declines[target.key] - declines[ref.key]
    rows.append(
        {
            "contribution": f"➜ écart de baisse ({target.key} − {ref.key})",
            "total 1re sem": "",
            "total pic": "",
            "total dernière": "",
            "baisse pic→dernière": f"{gap:+.0f} pts",
            "évol. 1re→dernière": "",
        }
    )
    return pd.DataFrame(rows)


# --------------------------------------------------------------------------- #
# Data sources
# --------------------------------------------------------------------------- #
def _iter_week_starts(start: date, end: date):
    """Yield Monday-aligned week-start dates covering ``[start, end]``."""
    cursor = start - timedelta(days=start.weekday())
    while cursor <= end:
        yield cursor
        cursor += timedelta(days=7)


def _cache_path(start: str, end: str) -> Path:
    cache_dir = Path(__file__).resolve().parents[3] / "output" / ".cache"
    return cache_dir / f"pageurls_{start}_{end}.pkl"


def fetch_live(
    start: str, end: str, *, use_cache: bool = True
) -> dict[str, list[dict[str, Any]]]:
    """Pull the weekly page-URL reports from the Matomo Reporting API.

    The Matomo call for ~100 weeks takes a few minutes, so the raw result is
    cached to disk keyed by the date range: the first run is slow, every run
    after (tweaking the metric, the chart, the tables) is instant. Progress is
    printed with ``flush=True`` so a notebook cell never looks frozen while it
    waits. Pass ``use_cache=False`` to force a fresh pull.
    """
    # Imported lazily so --demo works without httpx/creds configured.
    from analysis.connectors.matomo_reporting import MatomoReportingConnector

    cache = _cache_path(start, end)
    if use_cache and cache.exists():
        print(f"• Cache Matomo: {cache.name}", flush=True)
        with cache.open("rb") as fh:
            return pickle.load(fh)

    print(
        f"⏳ Appel Matomo {start} → {end} … "
        "(1re fois : ~2-3 min pour ~100 semaines ; ensuite instantané via le cache)",
        flush=True,
    )
    t0 = time.perf_counter()
    with MatomoReportingConnector() as matomo:
        # Only page paths containing "contribution" cross the wire (server-side
        # filter); every URL we plot lives under /contribution/.
        weeks = matomo.get_page_urls_by_week(start, end, label_pattern="contribution")
    print(
        f"✓ {len(weeks)} semaines reçues en {time.perf_counter() - t0:.0f}s", flush=True
    )

    if use_cache:
        cache.parent.mkdir(parents=True, exist_ok=True)
        with cache.open("wb") as fh:
            pickle.dump(weeks, fh)
    return weeks


def build_demo_data() -> dict[str, list[dict[str, Any]]]:
    """Synthesize 78 weeks of page-URL rows in BOTH URL schemes.

    Deterministic (no RNG). It models a personalization rollout: generic traffic
    erodes as per-CC pages appear, and the URL scheme flips from flat to nested
    mid-way — exercising the exact matching/stitching path used on live data.
    """
    start = date(2025, 1, 6)  # a Monday
    n_weeks = 78
    scheme_flip = 34  # week index where flat -> nested
    demo_idccs = [1090, 1517, 2098, 3248, 787, 1596]  # a handful of CCs

    # Per contribution: (generic_peak, generic_floor_frac, perso_peak).
    profile = {
        "retraite": dict(g0=1400, gfloor=0.45, p0=900),
        "conges": dict(g0=2600, gfloor=0.30, p0=1500),
    }

    weeks: dict[str, list[dict[str, Any]]] = {}
    for i, wk in enumerate(
        _iter_week_starts(start, start + timedelta(weeks=n_weeks - 1))
    ):
        label = f"{wk.isoformat()},{(wk + timedelta(days=6)).isoformat()}"
        t = i / (n_weeks - 1)  # 0..1 progress
        wobble = 1.0 + 0.06 * ((i * 7) % 5 - 2) / 2  # small deterministic ripple
        rows: list[dict[str, Any]] = []

        for c in CONTRIBUTIONS:
            p = profile[c.key]
            # Generic decays from g0 towards g0*gfloor as personalization ramps.
            generic = p["g0"] * (p["gfloor"] + (1 - p["gfloor"]) * (1 - t) ** 1.6)
            generic *= wobble
            rows.append(
                {
                    "label": f"/contribution/{c.generic_slug}",
                    "nb_hits": round(generic),
                    "nb_visits": round(generic * 0.82),
                }
            )
            # Personalized total grows with the rollout; split across CCs.
            perso_total = p["p0"] * min(1.0, t * 1.8) * wobble
            per_cc = perso_total / len(demo_idccs)
            nested = i >= scheme_flip
            for idcc in demo_idccs:
                if nested:
                    path = f"/contribution/{c.generic_slug}/{idcc}-convention-{idcc}"
                else:
                    path = f"/contribution/{idcc}-{c.generic_slug}"
                rows.append(
                    {
                        "label": path,
                        "nb_hits": round(per_cc),
                        "nb_visits": round(per_cc * 0.85),
                    }
                )
        # A little unrelated noise, to prove the filter ignores it.
        rows.append({"label": "/contribution/autre-chose-sans-rapport", "nb_hits": 500})
        weeks[label] = rows
    return weeks


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def _parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--start", default="2024-09-01", help="range start YYYY-MM-DD")
    parser.add_argument(
        "--end",
        default=date.today().isoformat(),
        help="range end YYYY-MM-DD (default: today)",
    )
    parser.add_argument(
        "--metric",
        choices=sorted(METRICS),
        default="views",
        help="views = pageviews (nb_hits, default); visits = nb_visits",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="run on synthetic data, no Matomo credentials needed",
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
        print("• Source: synthetic demo data (no Matomo call)")
        weeks = build_demo_data()
    else:
        print(f"• Source: Matomo Reporting API  {args.start} → {args.end}")
        weeks = fetch_live(args.start, args.end, use_cache=not args.refresh)

    df = aggregate_weeks(weeks, metric_field)
    if df.empty:
        raise SystemExit("No data returned — check the date range and credentials.")

    args.out.mkdir(parents=True, exist_ok=True)
    suffix = "demo" if args.demo else args.metric
    csv_path = args.out / f"contrib_weekly_{suffix}.csv"
    weekly_csv_path = args.out / f"contrib_weekly_{suffix}_semaine.csv"
    relative_csv_path = args.out / f"contrib_weekly_{suffix}_ecart.csv"
    png_path = args.out / f"contrib_weekly_{suffix}.png"

    df.to_csv(csv_path, index=False)
    weekly = weekly_comparison(df)
    weekly.to_csv(weekly_csv_path, index=False)
    relative = relative_comparison(df)
    relative.to_csv(relative_csv_path, index=False)
    build_chart(df, metric_label, png_path)

    with pd.option_context(
        "display.max_rows", None, "display.width", None, "display.max_columns", None
    ):
        print(f"\n{len(df)} semaines, {df['week'].iloc[0]} → {df['week'].iloc[-1]}")
        print("\nComparaison des baisses (pic → dernière semaine):")
        print(decline_table(df).to_string(index=False))
        print("\nSynthèse totaux + écart de baisse entre les deux :")
        print(comparison_summary(df).to_string(index=False))
        print("\nSemaine par semaine (toutes les semaines) :")
        print(weekly.to_string(index=False))
        print("\nÉcart relatif congés vs retraite (base 100 à la 1re semaine) :")
        print(relative.to_string(index=False))
    print(f"\n✓ Chart        : {png_path}")
    print(f"✓ CSV          : {csv_path}")
    print(f"✓ CSV semaine  : {weekly_csv_path}")
    print(f"✓ CSV écart    : {relative_csv_path}")


if __name__ == "__main__":
    main()
