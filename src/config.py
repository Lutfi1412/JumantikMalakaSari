from pathlib import Path

# Root project
ROOT = Path(__file__).resolve().parents[1]

# Data & model dirs
DATA_DIR = ROOT / "data" / "kb"
MODELS_DIR = ROOT / "models"
WEB_INDEX_PATH = ROOT / "web" / "index.html"

# Pastikan folder ada
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# ====== DATA FILES ======
# CSV intent dan KB
INTENT_TRAIN = DATA_DIR / "intent_train.csv"     # kolom: text,intent
INTENT_VAL   = DATA_DIR / "intent_val.csv"       # opsional (tak wajib)
KB_CSV       = DATA_DIR / "kb.csv"               # kolom: question,answer,source (nama kolom fleksibel)

# ====== ARTIFACTS INTENT ======
INTENT_VECTORIZER_PATH = MODELS_DIR / "intent_vectorizer.pkl"
INTENT_CLF_PATH        = MODELS_DIR / "intent_clf.pkl"
INTENT_LABELS_PATH     = MODELS_DIR / "intent_labels.pkl"

# ====== ARTIFACTS KB (opsional vec; teks wajib) ======
KB_VECT_PATH  = MODELS_DIR / "kb_tfidf.pkl"      # akan berisi TfidfVectorizer yang di-fit ke pertanyaan
KB_TEXTS_PATH = MODELS_DIR / "kb_texts.pkl"      # list dict: {q,a,source}

# ====== THRESHOLD INTENT -> RAG fallback ======
MIN_INTENT_CONF = 0.45  # 0..1; naikkan jika ingin lebih sering fallback ke RAG
