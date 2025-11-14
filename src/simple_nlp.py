from __future__ import annotations
import pickle, math, re
from pathlib import Path
from typing import List, Tuple, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from .config import (
    INTENT_VECTORIZER_PATH, INTENT_CLF_PATH, INTENT_LABELS_PATH,
    KB_VECT_PATH, KB_TEXTS_PATH,
    MIN_INTENT_CONF,                 # mis. 0.45 – set di config.py
)

# -------------------- lazy loaders --------------------
_VEC: TfidfVectorizer | None = None
_CLF = None
_LABELS: List[str] | None = None

_KB_MAT = None          # TF-IDF matrix (numpy)
_KB_TEXTS = None        # list[dict] atau list[str]

_name_re = re.compile(r"\b(saya|aku)\s+([A-Z][a-zA-Z]+)", re.I)
_rt_re   = re.compile(r"\brt\s*[:\- ]?\s*(\d{1,3})", re.I)
_rw_re   = re.compile(r"\brw\s*[:\- ]?\s*(\d{1,3})", re.I)

def _load_intent() -> None:
    global _VEC, _CLF, _LABELS
    if _VEC is None:
        _VEC = pickle.loads(INTENT_VECTORIZER_PATH.read_bytes())
    if _CLF is None:
        _CLF = pickle.loads(INTENT_CLF_PATH.read_bytes())
    if _LABELS is None:
        _LABELS = pickle.loads(INTENT_LABELS_PATH.read_bytes())
        if isinstance(_LABELS, np.ndarray):
            _LABELS = list(map(str, _LABELS.tolist()))

def _load_kb() -> None:
    global _KB_MAT, _KB_TEXTS
    if _KB_MAT is None:
        _KB_MAT = pickle.loads(KB_VECT_PATH.read_bytes())
    if _KB_TEXTS is None:
        _KB_TEXTS = pickle.loads(KB_TEXTS_PATH.read_bytes())

# -------------------- helpers --------------------
def _as_bool(x) -> bool:
    # hindari ValueError boolean numpy array
    if x is None:
        return False
    if isinstance(x, (list, tuple, dict, set, str)):
        return len(x) > 0
    return True

def normalize_text(s: str) -> str:
    return re.sub(r"\s+", " ", s or "").strip()

# -------------------- INTENT --------------------
def infer_intent(text: str) -> Tuple[str, float, List[Tuple[str, float]]]:
    _load_intent()
    t = normalize_text(text)
    X = _VEC.transform([t])  # type: ignore
    # LogisticRegression -> predict_proba tersedia
    proba = _CLF.predict_proba(X)[0]  # type: ignore
    idx = int(np.argmax(proba))
    conf = float(proba[idx])
    label = str(_CLF.classes_[idx])   # type: ignore

    # top-k terurut
    order = np.argsort(proba)[::-1]
    topk = [(str(_CLF.classes_[i]), float(proba[i])) for i in order[:3]]  # type: ignore

    # threshold: bila rendah -> unknown
    if conf < float(MIN_INTENT_CONF):
        label = "unknown"

    return label, conf, topk

# -------------------- NER (sederhana) --------------------
def extract_entities(text: str) -> Dict[str, Any]:
    ents: Dict[str, Any] = {}
    m = _name_re.search(text or "")
    if m:
        ents["NAMA"] = m.group(2)
    m = _rt_re.search(text or "")
    if m:
        ents["RT"] = m.group(1)
    m = _rw_re.search(text or "")
    if m:
        ents["RW"] = m.group(1)
    # alamat kasar
    if "rt" in text.lower() or "rw" in text.lower():
        ents.setdefault("ALAMAT", normalize_text(text))
    return ents

# -------------------- KB / RAG --------------------
def _kb_search(query: str, topn: int = 1):
    _load_kb()
    # _KB_MAT bisa csr_matrix dari TfidfVectorizer.fit_transform semua entri
    if hasattr(_KB_MAT, "dtype"):
        # shape: (N, V)
        from .build_kb import vec  # NOTE: build_kb menyimpan vectorizer? Jika tidak, fallback pakai cosine dengan query yang sama fit()
        pass
    # aman: bikin vectorizer baru hanya untuk scoring ke teks KB (tidak memengaruhi model)
    texts = _KB_TEXTS
    corpus = []
    sources = []
    answers = []
    for item in texts:
        if isinstance(item, dict):
            corpus.append(item.get("q") or item.get("text") or item.get("question") or item.get("a") or "")
            answers.append(item.get("a") or item.get("answer") or item.get("text") or "")
            sources.append(item.get("source") or item.get("id") or "")
        else:
            corpus.append(str(item))
            answers.append(str(item))
            sources.append("")
    tf = TfidfVectorizer(ngram_range=(1,2), min_df=1).fit(corpus + [query])
    M = tf.transform(corpus)
    qv = tf.transform([query])
    sims = cosine_similarity(qv, M)[0]
    order = np.argsort(sims)[::-1][:topn]
    results = []
    for i in order:
        results.append({
            "score": float(sims[i]),
            "answer": answers[i],
            "source": sources[i],
            "text": corpus[i],
        })
    return results

def rag_answer(query: str) -> Dict[str, Any]:
    hits = _kb_search(query, topn=1)
    if hits:
        h = hits[0]
        return {"mode": "rag", "text": h["answer"], "ref": h["text"]}
    return {"mode": "rag", "text": "Maaf, informasi belum tersedia di basis pengetahuan."}

# -------------------- RULE (jawaban pasti per intent) --------------------
_RULES: Dict[str, str] = {
    # Pastikan label intent PERSIS seperti di CSV intent_train.csv kolom 'intent'
    "lapor_jentik": (
        "Terima kasih laporannya. Mohon kirim format: **Nama**, **Alamat**, **RT/RW**, dan **lokasi jentik** "
        "(bak mandi, talang, vas, dsb). Petugas akan menindaklanjuti."
    ),
    "jadwal_kunjungan": (
        "Jumantik melakukan pemeriksaan jentik secara berkala (umumnya tiap pekan) sesuai kesepakatan RW/RT. "
        "Cek papan pengumuman kelurahan atau grup WA RW, atau tanya Ketua RT/Kader Jumantik setempat."
    ),
    "prosedur_fogging": (
        "Fogging hanya membunuh nyamuk dewasa, bukan jentik. Tetap rutin PSN 3M Plus dan pemeriksaan jentik di rumah."
    ),
}

def rule_answer(intent_label: str, text: str, ents: Dict[str, Any]) -> Dict[str, Any] | None:
    ans = _RULES.get(intent_label)
    if not ans:
        return None
    # sisipkan entitas sederhana bila ada
    if "NAMA" in ents:
        ans = f"Halo {ents['NAMA']}, " + ans
    return {"mode": "rule", "text": ans}

# -------------------- Orkestrasi --------------------
def answer_rule_or_rag(text: str) -> Dict[str, Any]:
    label, conf, _ = infer_intent(text)
    ents = extract_entities(text)

    # Jika yakin & ada rule -> rule, else -> RAG
    if label != "unknown":
        ra = rule_answer(label, text, ents)
        if ra is not None:
            ra["intent"] = {"label": label, "confidence": conf}
            return ra

    # fallback RAG
    ra = rag_answer(text)
    ra["intent"] = {"label": label, "confidence": conf}
    return ra

# -------- payloads ke frontend (untuk ditampilkan rapi) --------
def intent_payload(q: str) -> Dict[str, Any]:
    lbl, conf, topk = infer_intent(q)
    return {
        "label": lbl,
        "confidence": round(conf * 100, 2),
        "topk": [(l, round(p * 100, 2)) for (l, p) in topk],
    }

def entities_payload(q: str) -> Dict[str, Any]:
    ents = extract_entities(q)
    # tampilkan sebagai list agar UI gampang
    items = [{"type": k, "value": v} for k, v in ents.items()]
    return {"items": items}
