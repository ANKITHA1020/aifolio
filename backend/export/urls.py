from django.urls import path
from . import views

urlpatterns = [
    path('html/<int:portfolio_id>/', views.export_html, name='export_html'),
    path('pdf/<int:portfolio_id>/', views.export_pdf, name='export_pdf'),
    path('jobs/<int:job_id>/', views.export_job_detail, name='export_job_detail'),
    path('jobs/<int:job_id>/download/', views.download_export, name='download_export'),
]

