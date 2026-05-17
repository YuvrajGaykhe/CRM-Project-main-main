from rest_framework.permissions import BasePermission, SAFE_METHODS


ROLE_SUPER_ADMIN = "super-admin"
ROLE_ADMIN = "admin"
ROLE_SALES_MANAGER = "sales-manager"
ROLE_DEALER_MANAGER = "dealer-manager"
ROLE_SALES_EXECUTIVE = "sales-executive"
ROLE_SUPPORT_STAFF = "support-staff"

LEAD_WRITE_ROLES = {
    ROLE_SUPER_ADMIN,
    ROLE_ADMIN,
    ROLE_SALES_MANAGER,
    ROLE_SALES_EXECUTIVE,
}

DEALER_WRITE_ROLES = {
    ROLE_SUPER_ADMIN,
    ROLE_ADMIN,
    ROLE_DEALER_MANAGER,
}

PRODUCT_WRITE_ROLES = {
    ROLE_SUPER_ADMIN,
    ROLE_ADMIN,
}

TASK_WRITE_ROLES = {
    ROLE_SUPER_ADMIN,
    ROLE_ADMIN,
    ROLE_SALES_MANAGER,
    ROLE_DEALER_MANAGER,
    ROLE_SALES_EXECUTIVE,
    ROLE_SUPPORT_STAFF,
}

ANALYTICS_VIEW_ROLES = {
    ROLE_SUPER_ADMIN,
    ROLE_ADMIN,
    ROLE_SALES_MANAGER,
    ROLE_DEALER_MANAGER,
    ROLE_SALES_EXECUTIVE,
    ROLE_SUPPORT_STAFF,
}


def get_role_slug(user):
    role = getattr(user, "role", None)
    return getattr(role, "slug", None)


def is_platform_admin(user):
    return bool(
        user
        and user.is_authenticated
        and (user.is_superuser or user.is_staff or get_role_slug(user) in {ROLE_SUPER_ADMIN, ROLE_ADMIN})
    )


class SigmaRolePermission(BasePermission):
    read_roles = set()
    write_roles = set()

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True

        role_slug = get_role_slug(request.user)
        if request.method in SAFE_METHODS:
            return not self.read_roles or role_slug in self.read_roles
        return not self.write_roles or role_slug in self.write_roles


class LeadPermission(SigmaRolePermission):
    write_roles = LEAD_WRITE_ROLES


class DealerPermission(SigmaRolePermission):
    write_roles = DEALER_WRITE_ROLES


class ProductPermission(SigmaRolePermission):
    write_roles = PRODUCT_WRITE_ROLES


class TaskPermission(SigmaRolePermission):
    write_roles = TASK_WRITE_ROLES


class AnalyticsPermission(SigmaRolePermission):
    read_roles = ANALYTICS_VIEW_ROLES
    write_roles = {ROLE_SUPER_ADMIN, ROLE_ADMIN}
