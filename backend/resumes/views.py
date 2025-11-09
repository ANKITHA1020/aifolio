from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ResumeUpload, ResumeData
from .serializers import ResumeUploadSerializer


class ResumeUploadViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing resume uploads
    """
    serializer_class = ResumeUploadSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ResumeUpload.objects.filter(user=self.request.user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'])
    def parse(self, request, pk=None):
        """
        Trigger resume parsing (calls AI service)
        """
        resume_upload = self.get_object()
        
        # This will be handled by the AI service endpoint
        # But we can trigger it here as well
        from ai_services.views import parse_resume
        
        # Call the parse_resume function
        request.data['resume_id'] = resume_upload.id
        return parse_resume(request)
    
    @action(detail=True, methods=['post'])
    def reparse(self, request, pk=None):
        """
        Re-parse an existing resume (delete old data and parse again)
        """
        resume_upload = self.get_object()
        
        # Delete existing parsed data
        try:
            resume_data = resume_upload.extracted_data
            if resume_data:
                resume_data.delete()
        except:
            pass
        
        # Trigger parsing
        from ai_services.views import parse_resume
        request.data['resume_id'] = resume_upload.id
        return parse_resume(request)