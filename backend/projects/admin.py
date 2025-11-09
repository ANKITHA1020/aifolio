from django.contrib import admin
from .models import Project, ProjectTag, ProjectCategory


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name', 'description']


@admin.register(ProjectTag)
class ProjectTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'category', 'featured', 'created_at']
    list_filter = ['featured', 'category', 'created_at', 'tags']
    search_fields = ['title', 'description', 'user__email']
    readonly_fields = ['slug', 'created_at', 'updated_at']
    filter_horizontal = ['tags']
    prepopulated_fields = {'slug': ('title',)}
