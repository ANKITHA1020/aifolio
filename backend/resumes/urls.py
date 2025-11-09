from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResumeUploadViewSet

router = DefaultRouter()
router.register(r'uploads', ResumeUploadViewSet, basename='resume-upload')

urlpatterns = [
    path('', include(router.urls)),
]

