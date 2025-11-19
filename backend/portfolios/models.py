from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
import json


class Template(models.Model):
    """
    Available portfolio templates
    """
    TEMPLATE_TYPE_CHOICES = [
        ('classic', 'Classic'),
        ('modern', 'Modern'),
        ('minimalist', 'Minimalist'),
        ('developer', 'Developer'),
        ('designer', 'Designer'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    type = models.CharField(max_length=20, choices=TEMPLATE_TYPE_CHOICES)
    description = models.TextField(blank=True)
    preview_image = models.ImageField(upload_to='templates/previews/', blank=True, null=True)
    config = models.JSONField(
        default=dict,
        help_text="Template configuration (colors, fonts, layouts, etc.)"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Portfolio(models.Model):
    """
    Main portfolio instance
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolios')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    template = models.ForeignKey(Template, on_delete=models.SET_NULL, null=True, blank=True)
    template_type = models.CharField(max_length=20, default='modern')
    is_published = models.BooleanField(default=False)
    custom_settings = models.JSONField(
        default=dict,
        help_text="Custom portfolio settings (colors, fonts, etc.)"
    )
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.TextField(blank=True)
    seo_keywords = models.CharField(max_length=500, blank=True)
    profile_photo = models.ImageField(upload_to='portfolios/profiles/', blank=True, null=True)
    meta_keywords = models.CharField(max_length=500, blank=True, help_text="SEO meta keywords")
    meta_description = models.TextField(blank=True, help_text="SEO meta description")
    pages = models.JSONField(
        default=list,
        help_text="Multi-page structure configuration"
    )
    navigation_enabled = models.BooleanField(default=True, help_text="Enable navigation between pages/sections")
    interactive_elements = models.JSONField(
        default=dict,
        help_text="Interactive features configuration (animations, effects, etc.)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'slug']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Portfolio.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


class PortfolioComponent(models.Model):
    """
    Modular portfolio components (Header, About, Skills, Projects, Blog, Contact)
    """
    COMPONENT_TYPE_CHOICES = [
        # Legacy types (keep for backward compatibility)
        ('header', 'Header'),
        ('about', 'About'),
        ('skills', 'Skills'),
        ('projects', 'Projects'),
        ('blog', 'Blog'),
        ('contact', 'Contact'),
        ('custom', 'Custom'),
        # New component types
        ('hero_banner', 'Hero Banner'),
        ('about_me_card', 'About Me Card'),
        ('skills_cloud', 'Skills Cloud'),
        ('experience_timeline', 'Experience Timeline'),
        ('project_grid', 'Project Grid'),
        ('services_section', 'Services Section'),
        ('achievements_counters', 'Achievements Counters'),
        ('testimonials_carousel', 'Testimonials Carousel'),
        ('blog_preview_grid', 'Blog Preview Grid'),
        ('contact_form', 'Contact Form'),
        ('footer', 'Footer'),
    ]
    
    portfolio = models.ForeignKey(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='components'
    )
    component_type = models.CharField(max_length=25, choices=COMPONENT_TYPE_CHOICES)
    order = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0)],
        help_text="Display order in portfolio"
    )
    is_visible = models.BooleanField(default=True)
    content = models.JSONField(
        default=dict,
        help_text="Component content data"
    )
    custom_css = models.TextField(blank=True, help_text="Custom CSS for this component")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['order', 'created_at']
        unique_together = ['portfolio', 'component_type', 'order']
    
    def __str__(self):
        return f"{self.portfolio.title} - {self.component_type} ({self.order})"


class PortfolioSettings(models.Model):
    """
    Portfolio appearance settings (colors, fonts, custom CSS)
    """
    portfolio = models.OneToOneField(
        Portfolio, 
        on_delete=models.CASCADE, 
        related_name='settings'
    )
    primary_color = models.CharField(max_length=7, default='#000000')
    secondary_color = models.CharField(max_length=7, default='#ffffff')
    accent_color = models.CharField(max_length=7, default='#007bff')
    font_family = models.CharField(max_length=100, default='Inter')
    font_size = models.CharField(max_length=20, default='16px')
    custom_logo = models.ImageField(upload_to='portfolios/logos/', blank=True, null=True)
    custom_background = models.ImageField(upload_to='portfolios/backgrounds/', blank=True, null=True)
    custom_css = models.TextField(blank=True, help_text="Global custom CSS")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Settings for {self.portfolio.title}"
