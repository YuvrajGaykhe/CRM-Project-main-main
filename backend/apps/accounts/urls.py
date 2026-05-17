from django.urls import path
from . import views

urlpatterns = [
    path("me/", views.MeAPIView.as_view(), name="me"),
    path("roles/", views.RoleListCreateAPIView.as_view(), name="role-list"),
    path("roles/<int:pk>/", views.RoleRetrieveUpdateDestroyAPIView.as_view(), name="role-detail"),
]
