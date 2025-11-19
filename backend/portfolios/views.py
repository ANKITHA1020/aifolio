from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from .models import Portfolio, PortfolioComponent, PortfolioSettings, Template
from .serializers import (
    PortfolioSerializer,
    PortfolioListSerializer,
    PortfolioComponentSerializer,
    PortfolioSettingsSerializer,
    TemplateSerializer
)
from ai_services.portfolio_content_generator import (
    generate_portfolio_keywords,
    generate_component_content,
    optimize_seo_content,
    suggest_improvements,
    generate_meta_description
)


class TemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing templates (read-only)
    """
    queryset = Template.objects.filter(is_active=True)
    serializer_class = TemplateSerializer
    permission_classes = [IsAuthenticated]


class PortfolioViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing portfolios
    """
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Portfolio.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PortfolioListSerializer
        return PortfolioSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post', 'patch'])
    def publish(self, request, pk=None):
        """Publish or unpublish a portfolio"""
        portfolio = self.get_object()
        portfolio.is_published = request.data.get('is_published', True)
        if portfolio.is_published and not portfolio.published_at:
            from django.utils import timezone
            portfolio.published_at = timezone.now()
        portfolio.save()
        return Response(PortfolioSerializer(portfolio).data)
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """Get portfolio preview data"""
        portfolio = self.get_object()
        serializer = PortfolioSerializer(portfolio)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='public/(?P<slug>[^/.]+)', permission_classes=[AllowAny])
    def public_view(self, request, slug=None):
        """Public view of published portfolio (no auth required)"""
        try:
            portfolio = Portfolio.objects.get(slug=slug, is_published=True)
            serializer = PortfolioSerializer(portfolio, context={'request': request})
            return Response(serializer.data)
        except Portfolio.DoesNotExist:
            return Response(
                {'error': 'Portfolio not found or not published'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_photo(self, request, pk=None):
        """Upload profile photo for portfolio"""
        portfolio = self.get_object()
        
        if 'photo' not in request.FILES:
            return Response(
                {'error': 'No photo file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        photo = request.FILES['photo']
        
        # Validate file type
        if not photo.content_type.startswith('image/'):
            return Response(
                {'error': 'File must be an image'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB)
        if photo.size > 5 * 1024 * 1024:
            return Response(
                {'error': 'File size must be less than 5MB'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        portfolio.profile_photo = photo
        portfolio.save()
        
        serializer = PortfolioSerializer(portfolio, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def generate_content(self, request, pk=None):
        """Generate portfolio content using AI"""
        portfolio = self.get_object()
        component_type = request.data.get('component_type')
        context = request.data.get('context', {})
        
        if not component_type:
            return Response(
                {'error': 'component_type is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get resume data if available
        resume_data = context.get('resume_data', {})
        if not resume_data:
            # Try to get from user's uploaded resumes
            try:
                from resumes.models import ResumeUpload
                latest_resume = ResumeUpload.objects.filter(
                    user=request.user,
                    status='completed'
                ).select_related('extracted_data').order_by('-uploaded_at').first()
                
                if latest_resume:
                    try:
                        resume_data_obj = latest_resume.extracted_data
                        if resume_data_obj and resume_data_obj.structured_data:
                            resume_data = resume_data_obj.structured_data
                    except AttributeError:
                        # extracted_data relationship doesn't exist
                        pass
            except Exception as e:
                print(f"Error fetching resume data: {e}")
                pass
        
        context['resume_data'] = resume_data
        context['template_type'] = portfolio.template_type
        context['existing_content'] = {}
        
        # Get existing component content if editing
        component_id = request.data.get('component_id')
        if component_id:
            try:
                component = PortfolioComponent.objects.get(
                    id=component_id,
                    portfolio=portfolio
                )
                context['existing_content'] = component.content
            except PortfolioComponent.DoesNotExist:
                pass
        
        try:
            generated_content = generate_component_content(component_type, context)
            return Response({
                'component_type': component_type,
                'content': generated_content,
                'success': True
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def optimize_seo(self, request, pk=None):
        """Optimize portfolio content for SEO"""
        portfolio = self.get_object()
        
        # Convert portfolio to dict for analysis
        serializer = PortfolioSerializer(portfolio, context={'request': request})
        portfolio_data = serializer.data
        
        try:
            optimization_result = optimize_seo_content(portfolio_data)
            return Response(optimization_result)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def suggestions(self, request, pk=None):
        """Get AI suggestions for portfolio improvements"""
        portfolio = self.get_object()
        
        # Convert portfolio to dict
        serializer = PortfolioSerializer(portfolio, context={'request': request})
        portfolio_data = serializer.data
        
        try:
            suggestions = suggest_improvements(portfolio_data)
            
            # Also generate keywords if not set
            keywords = []
            if not portfolio.meta_keywords and not portfolio.seo_keywords:
                keywords = generate_portfolio_keywords(portfolio_data)
            
            return Response({
                'suggestions': suggestions,
                'keywords': keywords,
                'meta_description': generate_meta_description(portfolio_data) if not portfolio.meta_description and not portfolio.seo_description else None
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def generate_keywords(self, request, pk=None):
        """Generate SEO keywords for portfolio"""
        portfolio = self.get_object()
        
        serializer = PortfolioSerializer(portfolio, context={'request': request})
        portfolio_data = serializer.data
        
        try:
            keywords = generate_portfolio_keywords(portfolio_data)
            return Response({
                'keywords': keywords,
                'keywords_string': ', '.join(keywords)
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def resume_data(self, request):
        """Get latest resume data for the current user"""
        try:
            from resumes.models import ResumeUpload
            latest_resume = ResumeUpload.objects.filter(
                user=request.user,
                status='completed'
            ).select_related('extracted_data').order_by('-uploaded_at').first()
            
            if latest_resume:
                try:
                    resume_data_obj = latest_resume.extracted_data
                    if resume_data_obj and resume_data_obj.structured_data:
                        return Response({
                            'resume_id': latest_resume.id,
                            'structured_data': resume_data_obj.structured_data,
                            'has_resume': True
                        })
                except AttributeError:
                    # extracted_data relationship doesn't exist
                    pass
            
            return Response({
                'has_resume': False,
                'structured_data': {},
                'message': 'No parsed resume found. Please upload and parse a resume first.'
            })
        except Exception as e:
            return Response(
                {'error': str(e), 'has_resume': False, 'structured_data': {}},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PortfolioComponentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing portfolio components
    """
    serializer_class = PortfolioComponentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        portfolio_id = self.kwargs.get('portfolio_pk')
        portfolio = get_object_or_404(Portfolio, pk=portfolio_id, user=self.request.user)
        return PortfolioComponent.objects.filter(portfolio=portfolio)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        portfolio_id = self.kwargs.get('portfolio_pk')
        if portfolio_id:
            context['portfolio'] = get_object_or_404(
                Portfolio, 
                pk=portfolio_id, 
                user=self.request.user
            )
        return context
    
    def perform_create(self, serializer):
        portfolio_id = self.kwargs.get('portfolio_pk')
        portfolio = get_object_or_404(Portfolio, pk=portfolio_id, user=self.request.user)
        serializer.save(portfolio=portfolio)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Get dashboard statistics
    """
    user = request.user
    
    portfolios = Portfolio.objects.filter(user=user)
    total_portfolios = portfolios.count()
    published_count = portfolios.filter(is_published=True).count()
    drafts_count = total_portfolios - published_count
    
    # Recent activity (simplified)
    recent_portfolios = portfolios.order_by('-updated_at')[:5]
    recent_activity = [
        {
            'type': 'portfolio_updated',
            'description': f'Updated portfolio: {p.title}',
            'timestamp': p.updated_at.isoformat()
        }
        for p in recent_portfolios
    ]
    
    return Response({
        'total_portfolios': total_portfolios,
        'published_count': published_count,
        'drafts_count': drafts_count,
        'recent_activity': recent_activity
    })