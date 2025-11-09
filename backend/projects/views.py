from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Project, ProjectTag, ProjectCategory
from .serializers import (
    ProjectSerializer,
    ProjectTagSerializer,
    ProjectCategorySerializer
)
from ai_services.content_generator import generate_project_content


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing projects
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['post'])
    def generate_description(self, request):
        """
        Generate project description using AI
        """
        project_title = request.data.get('title', '')
        technologies = request.data.get('technologies', [])
        skills = request.data.get('skills', [])
        
        if not project_title:
            return Response(
                {'error': 'title is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Convert technologies and skills to lists if they're strings
        if isinstance(technologies, str):
            technologies = [t.strip() for t in technologies.split(',') if t.strip()]
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',') if s.strip()]
        
        try:
            result = generate_project_content(
                project_title=project_title,
                technologies=technologies or [],
                skills=skills or []
            )
            return Response(result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProjectTagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing project tags (read-only)
    """
    queryset = ProjectTag.objects.all()
    serializer_class = ProjectTagSerializer
    permission_classes = [IsAuthenticated]


class ProjectCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing project categories (read-only)
    """
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [IsAuthenticated]
