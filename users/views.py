from django.http import JsonResponse
import json
from .models import User

def login(request):
    if request.method == "POST":
        data = json.loads(request.body)

        email = data.get("email")
        password = data.get("password")

        try:
            user = User.objects.get(email=email, password=password)

            request.session['user_id'] = user.id

            return JsonResponse({
                "message": "Login successful",
                "role": user.role
            })

        except User.DoesNotExist:
            return JsonResponse({"error": "Invalid credentials"})

    # 🔥 THIS PART FIXES YOUR ERROR
    return JsonResponse({
        "message": "Use POST request to login"
    })