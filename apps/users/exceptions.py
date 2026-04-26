"""
Custom Exception Handler for consistent API error responses.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger('apps.users')


def custom_exception_handler(exc, context):
    """
    Wrap DRF errors in a consistent envelope:
    {
        "success": false,
        "error": { "code": "...", "message": "...", "details": {...} }
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'error': {
                'code': _get_error_code(response.status_code),
                'message': _flatten_errors(response.data),
                'details': response.data,
            }
        }
        response.data = error_data

    return response


def _get_error_code(status_code):
    codes = {
        400: 'BAD_REQUEST',
        401: 'UNAUTHORIZED',
        403: 'FORBIDDEN',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        429: 'RATE_LIMITED',
        500: 'SERVER_ERROR',
    }
    return codes.get(status_code, 'ERROR')


def _flatten_errors(data):
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        messages = []
        for key, val in data.items():
            if isinstance(val, list):
                messages.extend([str(v) for v in val])
            else:
                messages.append(str(val))
        return ' '.join(messages)
    if isinstance(data, list):
        return ' '.join([str(e) for e in data])
    return str(data)
