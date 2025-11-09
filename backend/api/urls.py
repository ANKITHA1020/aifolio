from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Authentication endpoints
    path('auth/', include('accounts.urls')),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User endpoints
    path('users/', include('accounts.urls')),
    
    # Portfolio endpoints (includes dashboard stats)
    path('portfolios/', include('portfolios.urls')),
    
    # Dashboard endpoints (also accessible via portfolios)
    path('dashboard/', include('portfolios.urls')),
    
    # Project endpoints
    path('projects/', include('projects.urls')),
    
    # Blog endpoints
    path('blogs/', include('blogs.urls')),
    
    # AI endpoints
    path('ai/', include('ai_services.urls')),
    
    # Resume endpoints
    path('resumes/', include('resumes.urls')),
    
    # Analytics endpoints
    path('analytics/', include('analytics.urls')),
    
    # Export endpoints
    path('export/', include('export.urls')),
]

