from django.db import migrations


PRODUCTS = [
    {
        "sku": "BCD202",
        "name": "BCD202",
        "category": "amplifier",
        "rms_power": "2-channel RMS amplifier",
        "vehicle_fitment": "Tractors, commercial vehicles, MPVs",
        "description": "Sigma Audio amplifier for high-durability Indian road and field use cases.",
        "specifications": {
            "positioning": "Reliable everyday amplifier",
            "fitment": ["tractor", "truck", "mpv"],
            "market": "dealer and retailer demand",
        },
        "demand_score": 76,
    },
    {
        "sku": "BCD2401",
        "name": "BCD2401",
        "category": "amplifier",
        "rms_power": "4-channel RMS amplifier",
        "vehicle_fitment": "Trucks, MPVs, premium commercial installations",
        "description": "High-output Sigma Audio amplifier for richer cabin audio experiences.",
        "specifications": {
            "positioning": "High-output dealer favorite",
            "fitment": ["truck", "mpv", "commercial_vehicle"],
            "market": "premium upgrades",
        },
        "demand_score": 83,
    },
    {
        "sku": "BC202 PRO",
        "name": "BC202 PRO",
        "category": "amplifier",
        "rms_power": "Pro-grade RMS amplifier",
        "vehicle_fitment": "Heavy-duty Indian road conditions",
        "description": "Professional Sigma Audio amplifier for rugged, high-demand installations.",
        "specifications": {
            "positioning": "Performance pro line",
            "fitment": ["tractor", "truck", "commercial_vehicle"],
            "market": "performance-led inquiries",
        },
        "demand_score": 88,
    },
]


def seed_products(apps, schema_editor):
    Product = apps.get_model("products", "Product")
    for item in PRODUCTS:
        Product.objects.update_or_create(
            sku=item["sku"],
            defaults=item,
        )


class Migration(migrations.Migration):
    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_products, migrations.RunPython.noop),
    ]
