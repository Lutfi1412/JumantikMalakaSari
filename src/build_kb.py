from __future__ import annotations
import pickle, re
from pathlib import Path
from typing import List, Tuple
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

from .config import KB_CSV, KB_VECT_PATH, KB_TEXTS_PATH

# Kandidat nama kolom
Q_CANDS = ["question", "pertanyaan", "q", "text", "teks", "tanya", "ask", "pertanyaan_kb"]
A_CANDS = ["answer", "jawaban", "a", "response", "respon", "jawab", "ans", "balasan"]
S_CANDS = ["source", "sumber", "ref", "referensi", "id"]

def _choose_col(df: pd.DataFrame, cands: List[str]) -> str | None:
    cols_low = {c.lower(): c for c in df.columns}
    for c in cands:
        if c in cols_low:
            return cols_low[c]
    # long-shot: hapus spasi/char non-alfanumerik
    norm = {re.sub(r"[^a-z0-9]", "", k.lower()): k for k in df.columns}
    for c in cands:
        key = re.sub(r"[^a-z0-9]", "", c.lower())
        if key in norm:
            return norm[key]
    return None

def _auto_pick_qa(df: pd.DataFrame) -> Tuple[str, str]:
    """Jika alias tak ketemu, pilih 2 kolom paling 'tekstual' (rata-rata panjang string terbesar)."""
    scores = []
    sample = df.head(50).fillna("")
    for c in df.columns:
        # nilai rata-rata panjang string
        mean_len = sample[c].astype(str).map(len).mean()
        # penalti jika kolom terlalu numerik
        num_ratio = (sample[c].astype(str).str.fullmatch(r"\s*[\d.,]+\s*", na=False)).mean()
        scores.append((mean_len - 50*num_ratio, c))
    scores.sort(reverse=True)
    top = [c for _, c in scores[:2]]
    if len(top) < 2:
        raise ValueError("Tidak cukup kolom untuk auto-pick Q/A.")
    return top[0], top[1]

def main() -> None:
    if not KB_CSV.exists():
        raise FileNotFoundError(f"kb.csv tidak ditemukan di {KB_CSV}")

    df = pd.read_csv(KB_CSV, encoding="utf-8-sig").fillna("")
    if df.empty:
        raise ValueError("kb.csv kosong.")

    q_col = _choose_col(df, Q_CANDS)
    a_col = _choose_col(df, A_CANDS)
    s_col = _choose_col(df, S_CANDS)

    # fallback heuristik
    if q_col is None or a_col is None:
        q_auto, a_auto = _auto_pick_qa(df)
        q_col = q_col or q_auto
        a_col = a_col or a_auto
        print(f"[INFO] Kolom Q/A otomatis dipilih: Q='{q_col}', A='{a_col}'")

    print(f"[INFO] Kolom yang dipakai → Q='{q_col}', A='{a_col}', Source='{s_col or '-'}'")

    records = []
    for _, r in df.iterrows():
        q = str(r[q_col]).strip()
        a = str(r[a_col]).strip()
        src = str(r[s_col]).strip() if s_col else ""
        if q and a:
            records.append({"q": q, "a": a, "source": src})

    if not records:
        raise ValueError("Tidak ada pasangan Q-A valid setelah pembersihan.")

    # Simpan teks KB
    KB_TEXTS_PATH.write_bytes(pickle.dumps(records))

    # Fit TF-IDF vectorizer ke pertanyaan
    vec = TfidfVectorizer(ngram_range=(1, 2), min_df=1).fit([r["q"] for r in records])
    KB_VECT_PATH.write_bytes(pickle.dumps(vec))

    print(f"✅ KB built: {KB_VECT_PATH.name} {KB_TEXTS_PATH.name}")
    print(f"[INFO] Total entri KB: {len(records)}")

if __name__ == "__main__":
    main()
