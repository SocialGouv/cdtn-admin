import pandas as pd

from analysis.l2.docs.sync import add_content_hash, content_hash, reconcile


def _doc(i, text="t", title="T", breadcrumbs="b"):
    return {"id": i, "title": title, "text": text, "breadcrumbs": breadcrumbs}


def _old(*docs):
    return add_content_hash(pd.DataFrame(docs))


def test_content_hash_is_stable_and_content_sensitive():
    assert content_hash("a", "b", "c") == content_hash("a", "b", "c")
    assert content_hash("a", "b", "c") != content_hash("a", "b2", "c")
    assert content_hash(None, "b", "c") == content_hash("", "b", "c")


def test_reconcile_classifies_all_buckets():
    old = _old(
        _doc("same"),
        _doc("chg", text="old"),
        _doc("gone", text="gone"),
        _doc("old-id", text="moved"),
    )
    fresh = [
        _doc("same"),
        _doc("chg", text="new"),
        _doc("new-id", text="moved"),
        _doc("brand-new", text="fresh"),
    ]
    r = reconcile(old, fresh)
    assert r.unchanged_ids == ["same"]
    assert r.changed_ids == ["chg"]
    assert r.reissued == {"old-id": "new-id"}
    assert [d["id"] for d in r.new_docs] == ["brand-new"]
    assert r.removed_ids == ["gone"]
    assert r.ambiguous_hash_matches == 0


def test_reconcile_duplicate_content_is_ambiguous_not_reissued():
    old = _old(_doc("o1", text="dup"), _doc("o2", text="dup"))
    fresh = [_doc("n1", text="dup"), _doc("n2", text="dup")]
    r = reconcile(old, fresh)
    assert r.reissued == {}
    assert sorted(r.removed_ids) == ["o1", "o2"]
    assert sorted(d["id"] for d in r.new_docs) == ["n1", "n2"]
    assert r.ambiguous_hash_matches == 4
