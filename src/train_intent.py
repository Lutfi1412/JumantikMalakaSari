from __future__ import annotations
import pickle
from pathlib import Path
from typing import Optional

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

from .config import (
    INTENT_TRAIN,
    INTENT_VECTORIZER_PATH,
    INTENT_CLF_PATH,
    INTENT_LABELS_PATH,
)

def _read_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"File tidak ditemukan: {path}")
    return pd.read_csv(path, encoding="utf-8-sig")

def _safe_split(X, y, test_size=0.2, random_state=42):
    """Stratify jika memungkinkan; jika ada kelas <2 atau dataset kecil, fallback tanpa stratify.
       Jika tetap tidak memungkinkan (mis. total baris <5), latih di full data (return None untuk test)."""
    y_counts = pd.Series(y).value_counts()
    can_stratify = (y_counts.min() >= 2)

    if len(X) < 5:
        # dataset terlalu kecil untuk split yang bermakna
        return (X, None, y, None, False)

    try:
        if can_stratify:
            X_tr, X_te, y_tr, y_te = train_test_split(
                X, y, test_size=test_size, random_state=random_state, stratify=y
            )
        else:
            X_tr, X_te, y_tr, y_te = train_test_split(
                X, y, test_size=test_size, random_state=random_state, stratify=None
            )
        return (X_tr, X_te, y_tr, y_te, True)
    except Exception:
        # fallback terakhir: latih full data
        return (X, None, y, None, False)

def main() -> None:
    df = _read_csv(INTENT_TRAIN)
    if not {"text","intent"}.issubset(df.columns):
        raise ValueError("CSV intent harus minimal punya kolom: text,intent")
    df = df.dropna(subset=["text","intent"]).reset_index(drop=True)
    X = df["text"].astype(str).tolist()
    y = df["intent"].astype(str).tolist()

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1,2), min_df=1)),
        ("clf",   LogisticRegression(max_iter=500, class_weight="balanced")),
    ])

    X_tr, X_te, y_tr, y_te, has_test = _safe_split(X, y, test_size=0.2, random_state=42)
    pipe.fit(X_tr, y_tr)

    if has_test and X_te is not None:
        y_hat = pipe.predict(X_te)
        acc = accuracy_score(y_te, y_hat)
        print(f"Eval/accuracy: {acc:.4f}")
        try:
            print(classification_report(y_te, y_hat))
        except Exception:
            pass
    else:
        print("Info: dataset kecil/tidak merata → dilatih di seluruh data tanpa evaluasi hold-out.")

    # simpan komponen
    vec: TfidfVectorizer = pipe.named_steps["tfidf"]
    clf: LogisticRegression = pipe.named_steps["clf"]

    INTENT_VECTORIZER_PATH.write_bytes(pickle.dumps(vec))
    INTENT_CLF_PATH.write_bytes(pickle.dumps(clf))
    INTENT_LABELS_PATH.write_bytes(pickle.dumps(sorted(set(y))))

    print(f"✅ Intent model saved: {INTENT_VECTORIZER_PATH.name} {INTENT_CLF_PATH.name} {INTENT_LABELS_PATH.name}")

if __name__ == "__main__":
    main()
