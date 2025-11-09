from django.contrib import admin
from .models import PortfolioView, ClickEvent, AnalyticsReport


@admin.register(PortfolioView)
class PortfolioViewAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'ip_address', 'viewed_at', 'duration']
    list_filter = ['viewed_at', 'portfolio']
    search_fields = ['portfolio__title', 'ip_address']
    readonly_fields = ['viewed_at']
    date_hierarchy = 'viewed_at'


@admin.register(ClickEvent)
class ClickEventAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'element_id', 'element_type', 'clicked_at', 'ip_address']
    list_filter = ['element_type', 'clicked_at', 'portfolio']
    search_fields = ['portfolio__title', 'element_id', 'ip_address']
    readonly_fields = ['clicked_at']
    date_hierarchy = 'clicked_at'


@admin.register(AnalyticsReport)
class AnalyticsReportAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'date', 'total_views', 'unique_visitors', 'total_clicks']
    list_filter = ['date', 'portfolio']
    search_fields = ['portfolio__title']
    readonly_fields = ['created_at']
    date_hierarchy = 'date'
