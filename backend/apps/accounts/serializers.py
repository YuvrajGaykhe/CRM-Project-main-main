from rest_framework import serializers
from .models import Role


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "permissions",
            "is_system",
            "created_at",
            "updated_at",
        ]
