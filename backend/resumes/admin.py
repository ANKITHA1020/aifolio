from django.contrib import admin
from .models import ResumeUpload, ResumeData, ParsedSkill


class ParsedSkillInline(admin.TabularInline):
    model = ParsedSkill
    extra = 0
    readonly_fields = ['confidence_score']


@admin.register(ResumeUpload)
class ResumeUploadAdmin(admin.ModelAdmin):
    list_display = ['user', 'file', 'status', 'uploaded_at']
    list_filter = ['status', 'uploaded_at']
    search_fields = ['user__email', 'file']
    readonly_fields = ['uploaded_at', 'status', 'error_message']
    date_hierarchy = 'uploaded_at'


@admin.register(ResumeData)
class ResumeDataAdmin(admin.ModelAdmin):
    list_display = ['resume_upload', 'extracted_at']
    readonly_fields = ['extracted_at', 'updated_at']
    inlines = [ParsedSkillInline]
    date_hierarchy = 'extracted_at'
