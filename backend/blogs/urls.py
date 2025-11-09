from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BlogPostViewSet, BlogTagViewSet, BlogCategoryViewSet

router = DefaultRouter()
router.register(r'posts', BlogPostViewSet, basename='blog-post')
router.register(r'tags', BlogTagViewSet, basename='blog-tag')
router.register(r'categories', BlogCategoryViewSet, basename='blog-category')

urlpatterns = [
    path('', include(router.urls)),
]

