from django.db import models
from django.contrib.auth.models import User


class ResumeUpload(models.Model):
    """
    Uploaded resume files
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resume_uploads')
    file = models.FileField(upload_to='resumes/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True, null=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.file.name}"


class ResumeData(models.Model):
    """
    Extracted structured data from resume
    """
    resume_upload = models.OneToOneField(
        ResumeUpload,
        on_delete=models.CASCADE,
        related_name='extracted_data'
    )
    raw_text = models.TextField(help_text="Raw extracted text from resume")
    structured_data = models.JSONField(
        default=dict,
        help_text="Structured resume data (name, email, phone, experience, education, etc.)"
    )
    extracted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Resume Data"
        verbose_name_plural = "Resume Data"
    
    def __str__(self):
        return f"Resume Data for {self.resume_upload.user.email}"


class ParsedSkill(models.Model):
    """
    Extracted skills from resume
    """
    SKILL_CATEGORY_CHOICES = [
        ('technical', 'Technical'),
        ('soft', 'Soft Skills'),
        ('language', 'Languages'),
        ('framework', 'Frameworks'),
        ('tool', 'Tools'),
        ('other', 'Other'),
    ]
    
    resume_data = models.ForeignKey(
        ResumeData,
        on_delete=models.CASCADE,
        related_name='skills'
    )
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=20, choices=SKILL_CATEGORY_CHOICES, default='technical')
    confidence_score = models.FloatField(
        default=0.0,
        help_text="AI confidence score (0.0 to 1.0)"
    )
    
    class Meta:
        unique_together = ['resume_data', 'name']
        ordering = ['-confidence_score', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.category})"
