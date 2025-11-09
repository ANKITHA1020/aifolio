from django.urls import path
from . import views

urlpatterns = [
    path('portfolios/<int:portfolio_id>/stats/', views.portfolio_stats, name='portfolio_stats'),
    path('portfolios/<int:portfolio_id>/views/', views.portfolio_views, name='portfolio_views'),
    path('portfolios/<int:portfolio_id>/clicks/', views.portfolio_clicks, name='portfolio_clicks'),
    path('portfolios/<int:portfolio_id>/reports/', views.portfolio_reports, name='portfolio_reports'),
    path('portfolios/<int:portfolio_id>/track-view/', views.track_view, name='track_view'),
    path('portfolios/<int:portfolio_id>/track-click/', views.track_click, name='track_click'),
]

