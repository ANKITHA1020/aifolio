from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify


class BlogCategory(models.Model):
    """
    Blog categories
    """
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name_plural = "Blog Categories"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class BlogTag(models.Model):
    """
    Blog tags
    """
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class BlogPost(models.Model):
    """
    Blog posts
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, blank=True)
    content_markdown = models.TextField(help_text="Blog content in Markdown format")
    excerpt = models.TextField(max_length=500, blank=True, help_text="Short excerpt for preview")
    featured_image = models.ImageField(upload_to='blogs/images/', blank=True, null=True)
    category = models.ForeignKey(
        BlogCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='posts'
    )
    tags = models.ManyToManyField(BlogTag, blank=True, related_name='posts')
    published = models.BooleanField(default=False)
    published_date = models.DateTimeField(null=True, blank=True)
    views = models.IntegerField(default=0, help_text="Number of views")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-published_date', '-created_at']
    
    def __str__(self):
        return f"{self.user.email} - {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug, user=self.user).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        if self.published and not self.published_date:
            from django.utils import timezone
            self.published_date = timezone.now()
        super().save(*args, **kwargs)
