from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import models
from .models import BlogPost, BlogTag, BlogCategory
from .serializers import (
    BlogPostSerializer,
    BlogTagSerializer,
    BlogCategorySerializer
)
from ai_services.content_generator import (
    generate_blog_outline,
    generate_blog_content,
    generate_blog_excerpt,
    improve_blog_content
)


class BlogPostViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing blog posts
    """
    serializer_class = BlogPostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if self.action == 'list':
            # Users can see their own posts and published posts from others
            return BlogPost.objects.filter(
                models.Q(user=user) | models.Q(published=True)
            )
        # For other actions, only own posts
        return BlogPost.objects.filter(user=user)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def increment_views(self, request, pk=None):
        """Increment view count (public endpoint)"""
        post = self.get_object()
        post.views += 1
        post.save(update_fields=['views'])
        return Response({'views': post.views})
    
    @action(detail=False, methods=['post'])
    def generate_outline(self, request):
        """Generate blog post outline from topic"""
        topic = request.data.get('topic', '')
        if not topic:
            return Response(
                {'error': 'topic is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            outline = generate_blog_outline(topic)
            return Response(outline)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def generate_content(self, request):
        """Generate full blog post content from topic or outline"""
        topic = request.data.get('topic', '')
        title = request.data.get('title', '')
        outline = request.data.get('outline')
        
        if not topic and not title and not outline:
            return Response(
                {'error': 'topic, title, or outline is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            content = generate_blog_content(
                topic=topic,
                title=title,
                outline=outline
            )
            return Response({'content': content})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def improve_content(self, request, pk=None):
        """Improve existing blog post content"""
        post = self.get_object()
        improve_grammar = request.data.get('improve_grammar', True)
        improve_seo = request.data.get('improve_seo', False)
        tone = request.data.get('tone', 'professional')
        
        try:
            improved_content = improve_blog_content(
                content=post.content_markdown,
                improve_grammar=improve_grammar,
                improve_seo=improve_seo,
                tone=tone
            )
            return Response({'improved_content': improved_content})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def generate_excerpt(self, request, pk=None):
        """Generate excerpt from blog post content"""
        post = self.get_object()
        max_length = request.data.get('max_length', 300)
        
        try:
            excerpt = generate_blog_excerpt(
                content=post.content_markdown,
                max_length=max_length
            )
            return Response({'excerpt': excerpt})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BlogTagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing blog tags (read-only)
    """
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [IsAuthenticated]


class BlogCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing blog categories (read-only)
    """
    queryset = BlogCategory.objects.all()
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAuthenticated]
