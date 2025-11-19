from django.db import models
from django.contrib.auth.models import User
from portfolios.models import Portfolio


class ExportJob(models.Model):
    """
    Portfolio export jobs
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    EXPORT_TYPE_CHOICES = [
        ('html', 'HTML/CSS/JS'),
        ('pdf', 'PDF Document'),
        ('zip', 'ZIP Package'),
        ('github', 'GitHub Pages'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='export_jobs')
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.CASCADE,
        related_name='exports'
    )
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPE_CHOICES, default='html')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    file_path = models.CharField(max_length=500, blank=True, help_text="Path to exported file")
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Export {self.export_type} for {self.portfolio.title} - {self.status}"
