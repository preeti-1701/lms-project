from django import template

register = template.Library()

@register.filter
def key(d, k):
    try:
        return d.get(k, False)
    except Exception:
        return False
