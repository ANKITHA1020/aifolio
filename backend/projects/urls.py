from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectTagViewSet, ProjectCategoryViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tags', ProjectTagViewSet, basename='project-tag')
router.register(r'categories', ProjectCategoryViewSet, basename='project-category')

urlpatterns = [
    path('', include(router.urls)),
]

