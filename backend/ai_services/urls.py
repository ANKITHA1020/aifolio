from django.urls import path
from . import views

urlpatterns = [
    path('parse-resume/', views.parse_resume, name='parse-resume'),
    path('generate-bio/', views.generate_bio, name='generate-bio'),
    path('extract-skills/', views.extract_skills, name='extract-skills'),
    path('generate-project-desc/', views.generate_project_description, name='generate-project-desc'),
    path('improve-text/', views.improve_text, name='improve-text'),
    path('analyze-seo/', views.analyze_seo, name='analyze-seo'),
]

