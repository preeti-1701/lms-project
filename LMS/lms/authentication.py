from rest_framework.authentication import SessionAuthentication


class SessionAuthenticationNoCsrf(SessionAuthentication):
    def enforce_csrf(self, request):
        return
