from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count, Avg, Q
from portfolios.models import Portfolio
from .models import PortfolioView, ClickEvent, AnalyticsReport
from django.contrib.auth.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_stats(request, portfolio_id):
    """
    Get overall statistics for a portfolio
    """
    portfolio = get_object_or_404(Portfolio, pk=portfolio_id, user=request.user)
    
    # Calculate stats
    total_views = PortfolioView.objects.filter(portfolio=portfolio).count()
    unique_visitors = PortfolioView.objects.filter(portfolio=portfolio).values('ip_address').distinct().count()
    total_clicks = ClickEvent.objects.filter(portfolio=portfolio).count()
    
    # Calculate average session duration
    views_with_duration = PortfolioView.objects.filter(portfolio=portfolio, duration__gt=0)
    avg_duration = views_with_duration.aggregate(Avg('duration'))['duration__avg'] or 0
    
    return Response({
        'total_views': total_views,
        'unique_visitors': unique_visitors,
        'total_clicks': total_clicks,
        'avg_session_duration': round(avg_duration, 2),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_views(request, portfolio_id):
    """
    Get view history for a portfolio
    """
    portfolio = get_object_or_404(Portfolio, pk=portfolio_id, user=request.user)
    
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    
    views = PortfolioView.objects.filter(portfolio=portfolio)
    
    if start_date:
        views = views.filter(viewed_at__gte=start_date)
    if end_date:
        views = views.filter(viewed_at__lte=end_date)
    
    # Group by date
    from django.db.models.functions import TruncDate
    daily_views = views.annotate(date=TruncDate('viewed_at')).values('date').annotate(
        views=Count('id'),
        unique_visitors=Count('ip_address', distinct=True)
    ).order_by('date')
    
    return Response(list(daily_views))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_clicks(request, portfolio_id):
    """
    Get click events for a portfolio
    """
    portfolio = get_object_or_404(Portfolio, pk=portfolio_id, user=request.user)
    
    clicks = ClickEvent.objects.filter(portfolio=portfolio).values(
        'element_id', 'element_type'
    ).annotate(count=Count('id')).order_by('-count')
    
    return Response(list(clicks))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def portfolio_reports(request, portfolio_id):
    """
    Get daily analytics reports for a portfolio
    """
    portfolio = get_object_or_404(Portfolio, pk=portfolio_id, user=request.user)
    
    reports = AnalyticsReport.objects.filter(portfolio=portfolio).order_by('-date')[:30]
    
    return Response([
        {
            'date': report.date.isoformat(),
            'total_views': report.total_views,
            'unique_visitors': report.unique_visitors,
            'total_clicks': report.total_clicks,
            'avg_session_duration': report.avg_session_duration,
        }
        for report in reports
    ])


@api_view(['POST'])
@permission_classes([])  # Public endpoint for tracking
def track_view(request, portfolio_id):
    """
    Track a portfolio view (public endpoint)
    """
    try:
        portfolio = Portfolio.objects.get(pk=portfolio_id, is_published=True)
    except Portfolio.DoesNotExist:
        return Response({'error': 'Portfolio not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get client info
    ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT', '')
    referrer = request.META.get('HTTP_REFERER', '')
    
    # Create view record
    PortfolioView.objects.create(
        portfolio=portfolio,
        ip_address=ip_address,
        user_agent=user_agent,
        referrer=referrer,
        duration=0
    )
    
    return Response({'status': 'tracked'})


@api_view(['POST'])
@permission_classes([])  # Public endpoint for tracking
def track_click(request, portfolio_id):
    """
    Track a click event (public endpoint)
    """
    try:
        portfolio = Portfolio.objects.get(pk=portfolio_id, is_published=True)
    except Portfolio.DoesNotExist:
        return Response({'error': 'Portfolio not found'}, status=status.HTTP_404_NOT_FOUND)
    
    element_id = request.data.get('element_id')
    element_type = request.data.get('element_type', '')
    ip_address = request.META.get('REMOTE_ADDR')
    
    if element_id:
        ClickEvent.objects.create(
            portfolio=portfolio,
            element_id=element_id,
            element_type=element_type,
            ip_address=ip_address
        )
    
    return Response({'status': 'tracked'})
