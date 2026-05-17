from rest_framework.permissions import BasePermission


class RoleRequired(BasePermission):
    allowed_roles = []

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        if not self.allowed_roles:
            return True
        role = getattr(request.user, "role", None)
        return role is not None and role.slug in self.allowed_roles


class AdminRoleRequired(RoleRequired):
    allowed_roles = ["super-admin", "admin"]
