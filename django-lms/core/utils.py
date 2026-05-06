from urllib.parse import urlparse, parse_qs


def extract_youtube_id(url: str):
    """Return the YouTube video ID from various URL shapes, or None."""
    if not url:
        return None
    try:
        u = urlparse(url)
    except Exception:
        return None
    host = (u.hostname or "").lower()
    if "youtu.be" in host:
        return u.path.lstrip("/").split("/")[0] or None
    qs = parse_qs(u.query)
    if "v" in qs and qs["v"]:
        return qs["v"][0]
    parts = [p for p in u.path.split("/") if p]
    for marker in ("embed", "shorts", "v"):
        if marker in parts:
            i = parts.index(marker)
            if i + 1 < len(parts):
                return parts[i + 1]
    return None


def youtube_embed_url(url: str):
    vid = extract_youtube_id(url)
    if not vid:
        return None
    return f"https://www.youtube-nocookie.com/embed/{vid}?rel=0&modestbranding=1&showinfo=0"
