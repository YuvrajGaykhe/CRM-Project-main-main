from django.urls import path
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.views import TokenRefreshView
from . import views


class LoginRateThrottle(AnonRateThrottle):
    scope = "login"


urlpatterns = [
    path(
        "token/",
        views.MyTokenObtainPairView.as_view(throttle_classes=[LoginRateThrottle]),
        name="token-obtain",
    ),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh-token"),
    path("register/", views.RegisterView.as_view(), name="register-user"),
    path("test/", views.protectedView, name="test"),
    path("", views.view_all_routes, name="all-routes"),
    path(
        "records/", views.RecordListCreateAPIView.as_view(), name="record-list-create"
    ),
    path(
        "records/<int:pk>/",
        views.RecordRetrieveUpdateDestroyAPIView.as_view(),
        name="record-retrieve-update-destroy",
    ),
    path("contacts/", views.ContactListCreateAPIView.as_view(), name="contact-list"),
    path(
        "contacts/<int:pk>/",
        views.ContactRetrieveUpdateDestroyAPIView.as_view(),
        name="contact-detail",
    ),
    path(
        "contacts/<int:contact_id>/interactions/",
        views.InteractionListCreateAPIView.as_view(),
        name="interaction-list-create",
    ),
    path(
        "interactions/<int:pk>/",
        views.InteractionRetrieveUpdateDestroyAPIView.as_view(),
        name="interaction-detail",
    ),
    path("tasks/", views.TaskListCreateAPIView.as_view(), name="task-list"),
    path(
        "tasks/<int:pk>/",
        views.TaskRetrieveUpdateDestroyAPIView.as_view(),
        name="task-detail",
    ),
    path("users/", views.UserListAPIView.as_view(), name="user-list"),
    path("analytics/", views.analytics_view, name="analytics"),
]
