from django.contrib import admin

from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("sku", "name", "category", "rms_power", "is_active", "demand_score")
    search_fields = ("sku", "name", "category")
    list_filter = ("category", "is_active")
