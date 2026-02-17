"""
Generate MP3 audio for each verse reference in verses.json using ElevenLabs (v3).
Saves files to assets/audio/david/{id}.mp3.
"""

import json
import os
from pathlib import Path

from elevenlabs.client import ElevenLabs

# --- Configuration (replace with your credentials) ---
# Free tier: use a default voice (e.g. 21m00Tcm4TlvDq8ikWAM). Library voices require a paid plan.
API_KEY = "sk_ab32954b6f3f8014eb462312c605dc446488467018fa1945"  # placeholder
VOICE_ID = "UgBBYS2sOqTuMpoF3BR0"  # placeholder voice id; free tier must use a default voice
MODEL_ID = "eleven_v3"
OUTPUT_FORMAT = "mp3_44100_128"

# Paths relative to this script's directory
SCRIPT_DIR = Path(__file__).resolve().parent
VERSES_JSON = SCRIPT_DIR / "src" / "assets" / "data" / "verses.json"
OUTPUT_DIR = SCRIPT_DIR / "assets" / "audio" / "david"


def load_verses() -> list[dict]:
    """Load verse references from verses.json."""
    with open(VERSES_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    verses = load_verses()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    client = ElevenLabs(api_key=API_KEY)
    total = len(verses)

    for i, entry in enumerate(verses, start=1):
        verse_id = entry["id"]
        reference = entry["reference"]
        # Use optional "text" field for full verse content; otherwise speak the reference
        text = entry.get("text") or reference
        out_path = OUTPUT_DIR / f"{verse_id}.mp3"

        if out_path.exists() and out_path.stat().st_size > 0:
            print(f"[{i}/{total}] Skipping {verse_id} (already exists)")
            continue

        print(f"[{i}/{total}] Generating {verse_id}: {reference!r}")

        try:
            # convert() returns a generator of bytes chunks; consume and concatenate
            audio_chunks = client.text_to_speech.convert(
                text=text,
                voice_id=VOICE_ID,
                model_id=MODEL_ID,
                output_format=OUTPUT_FORMAT,
            )
            audio = b"".join(audio_chunks)
            with open(out_path, "wb") as f:
                f.write(audio)
        except Exception as e:
            # Prefer API error message (e.g. 402 payment_required)
            msg = str(e)
            if "body:" in msg and "message" in msg:
                try:
                    import re
                    m = re.search(r"'message':\s*'([^']+)'", msg)
                    if m:
                        msg = m.group(1)
                except Exception:
                    pass
            print(f"  Error: {msg}")
            continue

    print(f"Done. Files saved to {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
