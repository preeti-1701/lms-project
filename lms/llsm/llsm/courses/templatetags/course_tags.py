from django import template
import re

register = template.Library()


@register.filter
def get_youtube_id(youtube_url):
    """Extract YouTube video ID from various YouTube URL formats."""
    if not youtube_url:
        return ''
    
    # Handle short YouTube URLs (youtu.be)
    if 'youtu.be' in youtube_url:
        return youtube_url.split('youtu.be/')[-1].split('?')[0]
    
    # Handle standard YouTube URLs (youtube.com)
    if 'youtube.com' in youtube_url:
        if 'v=' in youtube_url:
            return youtube_url.split('v=')[1].split('&')[0]
    
    # If it's already just an ID, return it
    if len(youtube_url) == 11 and not any(c in youtube_url for c in ['/', '?', '&']):
        return youtube_url
    
    return ''
