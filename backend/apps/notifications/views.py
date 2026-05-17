from django.utils import timezone
from rest_framework import decorators, filters, response, viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ["created_at", "read_at", "notification_type"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = Notification.objects.filter(user=self.request.user)
        unread = self.request.query_params.get("unread")
        if unread == "true":
            queryset = queryset.filter(read_at__isnull=True)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @decorators.action(methods=["post"], detail=True)
    def read(self, request, pk=None):
        notification = self.get_object()
        notification.read_at = timezone.now()
        notification.save(update_fields=["read_at", "updated_at"])
        return response.Response(self.get_serializer(notification).data)

    @decorators.action(methods=["post"], detail=False, url_path="mark_all_read")
    def mark_all_read(self, request):
        """Mark all unread notifications as read for the current user."""
        updated = Notification.objects.filter(
            user=request.user, read_at__isnull=True
        ).update(read_at=timezone.now())
        return response.Response({"marked_read": updated})

    @decorators.action(methods=["get"], detail=False, url_path="unread_count")
    def unread_count(self, request):
        """Return the unread notification count for the current user."""
        count = Notification.objects.filter(
            user=request.user, read_at__isnull=True
        ).count()
        return response.Response({"unread_count": count})
