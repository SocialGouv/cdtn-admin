import numpy as np
import pytest

from analysis.l2.signatures.core import (
    blend_vectors,
    compute_doc_centroid,
    cosine_sim_matrix,
    l2_normalize,
)


def test_l2_normalize_unit_rows_and_zero_safe():
    out = l2_normalize(np.array([[3.0, 4.0], [0.0, 0.0]]))
    assert np.allclose(out[0], [0.6, 0.8])
    assert np.allclose(out[1], [0.0, 0.0])


def test_cosine_sim_matrix_identity_and_orthogonal():
    a = np.array([[1.0, 0.0], [0.0, 1.0]])
    sims = cosine_sim_matrix(a, a)
    assert np.allclose(sims, np.eye(2))


def test_blend_vectors_ignores_none_and_zero_weight():
    v = np.array([1.0, 0.0])
    out = blend_vectors([(v, 1.0), (None, 5.0), (np.array([0.0, 1.0]), 0.0)])
    assert np.allclose(out, v)


def test_blend_vectors_raises_when_empty():
    with pytest.raises(ValueError):
        blend_vectors([(None, 1.0)])


def test_centroid_small_class_is_not_trimmed():
    emb = np.array([[1.0, 0.0], [0.0, 1.0]])
    res = compute_doc_centroid(np.array(["a", "b"]), emb, min_docs_to_trim=5)
    assert res.dropped_doc_ids == []
    assert res.n_docs == 2
    assert np.isclose(np.linalg.norm(res.centroid), 1.0)


def test_centroid_trims_outlier():
    rng = np.random.default_rng(0)
    tight = np.array([1.0, 0.0, 0.0]) + rng.normal(0, 0.01, size=(19, 3))
    outlier = np.array([[-1.0, 0.0, 0.0]])
    emb = np.vstack([tight, outlier])
    ids = np.array([f"d{i}" for i in range(20)])
    res = compute_doc_centroid(ids, emb)
    assert "d19" in res.dropped_doc_ids
    assert res.centroid[0] > 0.99
