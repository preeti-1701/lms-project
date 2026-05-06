from django.http import JsonResponse
from .models import ActiveSession


class SingleSessionMiddleware:

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):

        # ✅ Public routes
        excluded_paths = [
            "/api/token/",
            "/api/token/refresh/",
            "/api/register/",
            "/api/user/",
            "/admin/",
        ]

        for path in excluded_paths:
            if request.path.startswith(path):
                return self.get_response(request)

        # ✅ Only check authenticated users
        if request.user.is_authenticated:

            auth_header = request.headers.get("Authorization")

            if auth_header:

                try:

                    token = auth_header.split()[1]

                    session = ActiveSession.objects.filter(
                        user=request.user
                    ).first()

                    # ✅ Create first session
                    if not session:

                        ActiveSession.objects.create(
                            user=request.user,
                            token=token
                        )

                    # ✅ Check token mismatch
                    elif session.token != token:

                        return JsonResponse(
                            {"error": "Session expired"},
                            status=401
                        )

                except Exception as e:

                    print("Middleware Error:", e)

                    return JsonResponse(
                        {"error": "Invalid session"},
                        status=401
                    )

        return self.get_response(request)