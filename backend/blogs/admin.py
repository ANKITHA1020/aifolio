from django.contrib import admin
from .models import BlogPost, BlogTag, BlogCategory


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name', 'description']


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'category', 'published', 'views', 'published_date']
    list_filter = ['published', 'category', 'published_date', 'created_at', 'tags']
    search_fields = ['title', 'content_markdown', 'user__email']
    readonly_fields = ['slug', 'views', 'created_at', 'updated_at', 'published_date']
    filter_horizontal = ['tags']
    prepopulated_fields = {'slug': ('title',)}
    
    def save_model(self, request, obj, form, change):
        if obj.published and not obj.published_date:
            from django.utils import timezone
            obj.published_date = timezone.now()
        super().save_model(request, obj, form, change)
