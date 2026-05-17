from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)
    lead_uid = serializers.CharField(source="lead.lead_id", read_only=True)
    dealer_name = serializers.CharField(source="dealer.name", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "task_type",
            "status",
            "priority",
            "due_at",
            "assigned_to",
            "assigned_to_name",
            "lead",
            "lead_uid",
            "dealer",
            "dealer_name",
            "completed_at",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]
        read_only_fields = ["created_at", "updated_at", "created_by", "updated_by"]
