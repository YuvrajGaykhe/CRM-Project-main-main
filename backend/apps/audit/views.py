from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

from shared.permissions.rbac import (
    ROLE_ADMIN,
    ROLE_DEALER_MANAGER,
    ROLE_SALES_MANAGER,
    ROLE_SUPER_ADMIN,
    SigmaRolePermission,
)

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditReadPermission(SigmaRolePermission):
    read_roles = {
        ROLE_SUPER_ADMIN,
        ROLE_ADMIN,
        ROLE_SALES_MANAGER,
        ROLE_DEALER_MANAGER,
    }


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, AuditReadPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["action", "entity_type", "entity_id", "user__username", "user__email"]
    ordering_fields = ["created_at", "action", "entity_type"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = AuditLog.objects.select_related("user")
        entity_type = self.request.query_params.get("entity_type")
        action = self.request.query_params.get("action")
        if entity_type:
            queryset = queryset.filter(entity_type=entity_type)
        if action:
            queryset = queryset.filter(action=action)
        return queryset
