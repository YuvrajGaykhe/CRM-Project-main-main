from django.db import migrations


ROLE_PERMISSIONS = {
    "super-admin": ["*"],
    "admin": [
        "users.full",
        "roles.full",
        "leads.full",
        "dealers.full",
        "products.full",
        "tasks.full",
        "analytics.view",
        "integrations.full",
    ],
    "sales-manager": [
        "leads.full",
        "tasks.full",
        "followups.full",
        "analytics.view",
        "dealers.view",
        "products.view",
    ],
    "dealer-manager": [
        "dealers.full",
        "dealer_onboarding.approve",
        "leads.view",
        "tasks.full",
        "analytics.view",
        "products.view",
    ],
    "sales-executive": [
        "leads.own_full",
        "tasks.own_full",
        "followups.own_full",
        "analytics.view",
        "dealers.view",
        "products.view",
    ],
    "support-staff": [
        "leads.view",
        "tasks.own_full",
        "followups.own_full",
        "notifications.view",
        "products.view",
    ],
}


def apply_permissions(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    names = {
        "super-admin": "Super Admin",
        "admin": "Admin",
        "sales-manager": "Sales Manager",
        "dealer-manager": "Dealer Manager",
        "sales-executive": "Sales Executive",
        "support-staff": "Support Staff",
    }
    for slug, permissions in ROLE_PERMISSIONS.items():
        role, _ = Role.objects.get_or_create(
            slug=slug,
            defaults={"name": names[slug], "is_system": True},
        )
        role.permissions = permissions
        role.description = f"Sigma Audio platform role for {names[slug]} operations."
        role.save(update_fields=["permissions", "description", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_seed_roles"),
    ]

    operations = [
        migrations.RunPython(apply_permissions, migrations.RunPython.noop),
    ]
