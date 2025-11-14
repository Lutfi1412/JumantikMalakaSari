from __future__ import annotations
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, PlainTextResponse
from pathlib import Path

from .config import WEB_INDEX_PATH
from .simple_nlp import intent_payload, entities_payload, answer_rule_or_rag

app = FastAPI(title="Jumantik-Bot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"],
)

@app.get("/healthz")
async def healthz():
    return {"ok": True}

@app.get("/web/", response_class=HTMLResponse)
async def web():
    if not WEB_INDEX_PATH.exists():
        return HTMLResponse("index.html not found", status_code=404)
    return HTMLResponse(WEB_INDEX_PATH.read_text(encoding="utf-8"))

@app.post("/demo")
async def demo_api(req: Request):
    try:
        data = await req.json()
    except Exception:
        data = {}
    q = (data.get("text") or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="text is required")

    ans = answer_rule_or_rag(q)
    # UI butuh bagian intent + entities
    payload = {
        "intent": intent_payload(q),
        "entities": entities_payload(q),
        "answer": {"mode": ans.get("mode"), "text": ans.get("text")},
    }
    # kalau RAG & ada referensi
    if ans.get("mode") == "rag" and ans.get("ref"):
        payload["ref"] = str(ans["ref"])

    return JSONResponse(payload)

# endpoint untuk index.html test cepat
@app.get("/", response_class=PlainTextResponse)
async def root():
    return "Jumantik-Bot API is up"
