from django.db import models
from portfolios.models import Portfolio
from django.contrib.auth.models import User


class PortfolioView(models.Model):
    """
    Visitor tracking for portfolios
    """
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='views'
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referrer = models.URLField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)
    duration = models.IntegerField(
        default=0,
        help_text="View duration in seconds"
    )
    
    class Meta:
        ordering = ['-viewed_at']
        indexes = [
            models.Index(fields=['portfolio', '-viewed_at']),
            models.Index(fields=['viewed_at']),
        ]
    
    def __str__(self):
        return f"View of {self.portfolio.title} at {self.viewed_at}"


class ClickEvent(models.Model):
    """
    Click tracking for portfolio elements
    """
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='click_events'
    )
    element_id = models.CharField(max_length=100, help_text="ID of clicked element")
    element_type = models.CharField(
        max_length=50,
        blank=True,
        help_text="Type of element (button, link, project, etc.)"
    )
    clicked_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    class Meta:
        ordering = ['-clicked_at']
        indexes = [
            models.Index(fields=['portfolio', '-clicked_at']),
            models.Index(fields=['element_type', '-clicked_at']),
        ]
    
    def __str__(self):
        return f"Click on {self.element_id} in {self.portfolio.title} at {self.clicked_at}"


class AnalyticsReport(models.Model):
    """
    Aggregated analytics data for portfolios
    """
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    date = models.DateField(help_text="Date of the report")
    total_views = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    total_clicks = models.IntegerField(default=0)
    avg_session_duration = models.FloatField(
        default=0.0,
        help_text="Average session duration in seconds"
    )
    top_referrers = models.JSONField(
        default=list,
        help_text="Top referrers with counts"
    )
    top_pages = models.JSONField(
        default=list,
        help_text="Top pages/sections viewed"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['portfolio', 'date']
        ordering = ['-date']
    
    def __str__(self):
        return f"Analytics Report for {self.portfolio.title} on {self.date}"
