from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.api.serializers import MyTOPS


def _cookie_kwargs(max_age):
    return {
        "max_age": max_age,
        "httponly": settings.AUTH_COOKIE_HTTP_ONLY,
        "secure": settings.AUTH_COOKIE_SECURE,
        "samesite": settings.AUTH_COOKIE_SAMESITE,
        "path": settings.AUTH_COOKIE_PATH,
    }


class CookieTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTOPS

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code != status.HTTP_200_OK:
            return response

        access = response.data.get("access")
        refresh = response.data.get("refresh")
        if access:
            response.set_cookie(
                settings.AUTH_COOKIE,
                access,
                **_cookie_kwargs(settings.AUTH_COOKIE_MAX_AGE),
            )
        if refresh:
            response.set_cookie(
                settings.AUTH_COOKIE_REFRESH,
                refresh,
                **_cookie_kwargs(settings.AUTH_COOKIE_REFRESH_MAX_AGE),
            )
        response.data.pop("access", None)
        response.data.pop("refresh", None)
        return response


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)
        if refresh_token:
            payload = request.data.copy() if hasattr(request.data, "copy") else {}
            payload["refresh"] = refresh_token
            request._full_data = payload

        response = super().post(request, *args, **kwargs)
        if response.status_code != status.HTTP_200_OK:
            return response

        access = response.data.get("access")
        refresh = response.data.get("refresh")
        if access:
            response.set_cookie(
                settings.AUTH_COOKIE,
                access,
                **_cookie_kwargs(settings.AUTH_COOKIE_MAX_AGE),
            )
        if refresh:
            response.set_cookie(
                settings.AUTH_COOKIE_REFRESH,
                refresh,
                **_cookie_kwargs(settings.AUTH_COOKIE_REFRESH_MAX_AGE),
            )
        response.data.pop("access", None)
        response.data.pop("refresh", None)
        return response


class CookieTokenLogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"detail": "Logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie(
            settings.AUTH_COOKIE,
            path=settings.AUTH_COOKIE_PATH,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )
        response.delete_cookie(
            settings.AUTH_COOKIE_REFRESH,
            path=settings.AUTH_COOKIE_PATH,
            samesite=settings.AUTH_COOKIE_SAMESITE,
        )
        return response
