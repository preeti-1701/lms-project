"""Utility helpers (YouTube URL parsing, IP extraction)."""
from urllib.parse import urlparse, parse_qs


def extract_youtube_id(url: str) -> str | None:
    """Extract the video ID from any common YouTube URL format."""
    if not url:
        return None
    try:
        u = urlparse(url)
        if 'youtu.be' in u.netloc:
            return u.path.lstrip('/')
        qs = parse_qs(u.query)
        if 'v' in qs:
            return qs['v'][0]
        # /embed/<id>, /shorts/<id>, /v/<id>
        parts = [p for p in u.path.split('/') if p]
        for marker in ('embed', 'shorts', 'v'):
            if marker in parts:
                idx = parts.index(marker)
                if idx + 1 < len(parts):
                    return parts[idx + 1]
    except Exception:
        return None
    return None


def youtube_embed_url(url: str) -> str | None:
    """Return a privacy-enhanced embed URL for a YouTube video."""
    vid = extract_youtube_id(url)
    if not vid:
        return None
    return f"https://www.youtube-nocookie.com/embed/{vid}?rel=0&modestbranding=1"


def get_client_ip(request) -> str:
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')
