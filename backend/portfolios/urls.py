from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioViewSet, PortfolioComponentViewSet, TemplateViewSet, dashboard_stats

router = DefaultRouter()
router.register(r'templates', TemplateViewSet, basename='template')
router.register(r'portfolios', PortfolioViewSet, basename='portfolio')

urlpatterns = [
    path('', include(router.urls)),
    path(
        'portfolios/<int:portfolio_pk>/components/',
        PortfolioComponentViewSet.as_view({'get': 'list', 'post': 'create'}),
        name='portfolio-components-list'
    ),
    path(
        'portfolios/<int:portfolio_pk>/components/<int:pk>/',
        PortfolioComponentViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }),
        name='portfolio-components-detail'
    ),
    path('dashboard/stats/', dashboard_stats, name='dashboard_stats'),
]

