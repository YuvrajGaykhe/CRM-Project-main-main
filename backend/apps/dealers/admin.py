from django.contrib import admin

from .models import Dealer


@admin.register(Dealer)
class DealerAdmin(admin.ModelAdmin):
    list_display = ("name", "business_type", "state", "city", "tier", "status", "revenue_generated")
    search_fields = ("name", "gst_number", "contact_person", "mobile", "city", "state")
    list_filter = ("business_type", "tier", "status", "region", "state")
