from django.contrib import admin
from .models import Portfolio, PortfolioComponent, PortfolioSettings, Template


@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'type', 'is_active', 'created_at']
    list_filter = ['type', 'is_active']
    search_fields = ['name', 'description']


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'template_type', 'is_published', 'created_at']
    list_filter = ['template_type', 'is_published', 'created_at']
    search_fields = ['title', 'user__email']
    readonly_fields = ['slug', 'created_at', 'updated_at', 'published_at']
    prepopulated_fields = {'slug': ('title',)}


@admin.register(PortfolioComponent)
class PortfolioComponentAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'component_type', 'order', 'is_visible', 'created_at']
    list_filter = ['component_type', 'is_visible', 'created_at']
    search_fields = ['portfolio__title']
    ordering = ['portfolio', 'order']


@admin.register(PortfolioSettings)
class PortfolioSettingsAdmin(admin.ModelAdmin):
    list_display = ['portfolio', 'primary_color', 'font_family', 'created_at']
    search_fields = ['portfolio__title']
