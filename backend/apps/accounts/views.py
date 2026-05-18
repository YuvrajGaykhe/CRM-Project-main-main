from django.contrib.auth import get_user_model
from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.api.serializers import UserSerializer
from .models import Role
from .serializers import RoleSerializer
from shared.permissions.rbac import (
    ROLE_ADMIN,
    ROLE_DEALER_MANAGER,
    ROLE_SALES_MANAGER,
    ROLE_SUPER_ADMIN,
    SigmaRolePermission,
)
from shared.permissions.roles import AdminRoleRequired


class ManagementReadPermission(SigmaRolePermission):
    read_roles = {
        ROLE_SUPER_ADMIN,
        ROLE_ADMIN,
        ROLE_SALES_MANAGER,
        ROLE_DEALER_MANAGER,
    }


class RoleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, AdminRoleRequired]


class RoleRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, AdminRoleRequired]


class MeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = get_user_model().objects.select_related("role").order_by("id")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, ManagementReadPermission]


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated, AdminRoleRequired]
