from django.db import migrations


def seed_roles(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    roles = [
        ("Super Admin", "super-admin"),
        ("Admin", "admin"),
        ("Sales Manager", "sales-manager"),
        ("Dealer Manager", "dealer-manager"),
        ("Sales Executive", "sales-executive"),
        ("Support Staff", "support-staff"),
    ]
    for name, slug in roles:
        Role.objects.get_or_create(
            slug=slug,
            defaults={
                "name": name,
                "is_system": True,
            },
        )


def unseed_roles(apps, schema_editor):
    Role = apps.get_model("accounts", "Role")
    Role.objects.filter(slug__in=[
        "super-admin",
        "admin",
        "sales-manager",
        "dealer-manager",
        "sales-executive",
        "support-staff",
    ]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_roles, unseed_roles),
    ]
