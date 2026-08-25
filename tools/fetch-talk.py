#!/usr/bin/env python3
"""
Source material for the Talks theme, with no credential anywhere in the path.

    python tools/fetch-talk.py --list
    python tools/fetch-talk.py --fetch <videoId>

WHY THIS EXISTS

The first design for this routine ran through NotebookLM. NotebookLM has no
public API, so the `nlm` CLI drives a signed-in browser session — which means an
auth that expires, needs a relogin that force-kills the browser, and fails a
scheduled run at 07:00 with nobody watching. There is no long-lived credential
to ask for, because Google does not offer one for that product.

yt-dlp reads public captions the same way a browser does, anonymously. There is
no account, no cookie jar, and no token, so there is nothing to expire. That is
the whole reason for this file.

FALLBACK

If a video genuinely has no captions, `faster-whisper` is installed and can
transcribe locally — also offline and credential-free. That path additionally
needs `ffmpeg`, which is NOT currently on this machine, so it is reported as
unavailable rather than attempted. Install ffmpeg and it lights up.
"""

import argparse
import glob
import json
import os
import re
import sys
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path

from yt_dlp import YoutubeDL

ROOT = Path(__file__).resolve().parent
SOURCES = ROOT / "talk-sources.json"

# yt-dlp is chatty and writes progress to stdout, which would corrupt the JSON
# this script emits. Everything diagnostic goes to stderr instead.
QUIET = {"quiet": True, "no_warnings": True, "noprogress": True}


def log(msg):
    print(msg, file=sys.stderr)


def load_sources():
    cfg = json.loads(SOURCES.read_text(encoding="utf-8"))
    active = [s for s in cfg.get("sources", []) if s.get("active", True)]
    return cfg, active


def list_candidates(per_channel=4):
    """Recent videos across every active source, newest first."""
    cfg, sources = load_sources()
    max_age = int(cfg.get("maxAgeDays", 10))
    cutoff = datetime.now(timezone.utc) - timedelta(days=max_age)

    opts = {**QUIET, "extract_flat": "in_playlist", "playlistend": per_channel,
            "skip_download": True}

    out = []
    for src in sources:
        try:
            with YoutubeDL(opts) as ydl:
                info = ydl.extract_info(src["url"], download=False)
        except Exception as exc:
            log(f"  ! {src['name']}: {type(exc).__name__} — skipped")
            continue

        for e in info.get("entries") or []:
            if not e.get("id"):
                continue
            out.append(
                {
                    "id": e["id"],
                    "title": e.get("title") or "",
                    "url": f"https://www.youtube.com/watch?v={e['id']}",
                    "source": src["name"],
                    "kind": src.get("kind"),
                    "weight": src.get("weight", 1),
                    "duration": e.get("duration"),
                }
            )
        log(f"  · {src['name']}: {len(info.get('entries') or [])} listed")

    # extract_flat gives no upload date, so age is filtered at fetch time.
    out.sort(key=lambda v: -v.get("weight", 1))
    return {"maxAgeDays": max_age, "cutoff": cutoff.date().isoformat(), "candidates": out}


def vtt_to_prose(path):
    """VTT to plain prose. Auto-captions repeat each line as the karaoke
    highlight rolls, so consecutive duplicates are collapsed."""
    raw = Path(path).read_text(encoding="utf-8", errors="replace")
    lines = []
    for ln in raw.splitlines():
        s = ln.strip()
        if not s or "-->" in s or s.isdigit():
            continue
        if s.startswith(("WEBVTT", "Kind:", "Language:", "NOTE")):
            continue
        s = re.sub(r"<[^>]+>", "", s).strip()
        if s and (not lines or lines[-1] != s):
            lines.append(s)
    return " ".join(lines)


def fetch(video_id):
    out_dir = tempfile.mkdtemp()
    opts = {
        **QUIET,
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "subtitleslangs": ["en", "en-orig", "en-US", "en-GB"],
        "subtitlesformat": "vtt",
        "outtmpl": os.path.join(out_dir, "%(id)s.%(ext)s"),
    }
    with YoutubeDL(opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=True)

    files = sorted(glob.glob(os.path.join(out_dir, "*.vtt")))
    # Prefer a human-authored track ("en") over the auto one ("en-orig").
    files.sort(key=lambda f: (".en-orig." in f, f))
    transcript = vtt_to_prose(files[0]) if files else ""

    upload = info.get("upload_date")
    result = {
        "id": info.get("id"),
        "title": info.get("title"),
        "channel": info.get("channel"),
        "channelUrl": info.get("channel_url"),
        "uploadDate": f"{upload[:4]}-{upload[4:6]}-{upload[6:]}" if upload else None,
        "durationSeconds": info.get("duration"),
        "url": f"https://www.youtube.com/watch?v={info.get('id')}",
        "captionTracks": [os.path.basename(f) for f in files],
        "captionsAreAutomatic": bool(files) and ".en-orig." in files[0],
        "transcriptWords": len(transcript.split()),
        "transcript": transcript,
    }

    if not transcript:
        result["fallback"] = (
            "No captions published. faster-whisper is installed and could transcribe "
            "this locally, but it needs ffmpeg, which is not on this machine. Either "
            "install ffmpeg or pick a different video."
        )
    return result


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--list", action="store_true", help="recent videos across the allowlist")
    g.add_argument("--fetch", metavar="VIDEO_ID", help="metadata + transcript for one video")
    ap.add_argument("--per-channel", type=int, default=4)
    args = ap.parse_args()

    if args.list:
        log("scanning allowlist...")
        data = list_candidates(args.per_channel)
        log(f"{len(data['candidates'])} candidates")
    else:
        data = fetch(args.fetch)

    # stdout is JSON only, so a routine can pipe it straight into a parser.
    json.dump(data, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
