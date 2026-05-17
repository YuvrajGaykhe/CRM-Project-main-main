from django.utils import timezone
from rest_framework import decorators, filters, response, viewsets
from rest_framework.permissions import IsAuthenticated

from apps.audit.services import log_action
from shared.permissions.rbac import TaskPermission, get_role_slug, is_platform_admin

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, TaskPermission]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "lead__lead_id", "lead__full_name", "dealer__name"]
    ordering_fields = ["due_at", "priority", "status", "created_at"]
    ordering = ["status", "due_at"]

    def get_queryset(self):
        queryset = Task.objects.select_related("assigned_to", "lead", "dealer")
        status_filter = self.request.query_params.get("status")
        priority = self.request.query_params.get("priority")
        assigned_to = self.request.query_params.get("assigned_to")

        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority:
            queryset = queryset.filter(priority=priority)
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)

        role_slug = get_role_slug(self.request.user)
        if role_slug in {"sales-executive", "support-staff"} and not is_platform_admin(self.request.user):
            queryset = queryset.filter(assigned_to=self.request.user)

        return queryset

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user, updated_by=self.request.user)
        log_action(self.request.user, "task.created", task, request=self.request)

    def perform_update(self, serializer):
        task = serializer.save(updated_by=self.request.user)
        log_action(self.request.user, "task.updated", task, request=self.request)

    @decorators.action(methods=["post"], detail=True)
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = "done"
        task.completed_at = timezone.now()
        task.updated_by = request.user
        task.save(update_fields=["status", "completed_at", "updated_by", "updated_at"])
        log_action(request.user, "task.completed", task, request=request)
        return response.Response(self.get_serializer(task).data)
