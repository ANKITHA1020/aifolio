from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid


class UserProfile(models.Model):
    """
    Extended user profile model with additional information
    """
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    
    THEME_CHOICES = [
        ('light', 'Light'),
        ('dark', 'Dark'),
        ('auto', 'Auto'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, null=True, help_text="User's biography")
    photo = models.ImageField(upload_to='profiles/', blank=True, null=True)
    theme_preference = models.CharField(
        max_length=10, 
        choices=THEME_CHOICES, 
        default='auto',
        help_text="User's UI theme preference"
    )
    role = models.CharField(
        max_length=10, 
        choices=ROLE_CHOICES, 
        default='user',
        help_text="User role for access control"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.email}'s Profile"
    
    @property
    def email(self):
        return self.user.email
    
    @property
    def is_admin(self):
        return self.role == 'admin'


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create UserProfile when a User is created
    """
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Automatically save UserProfile when User is saved
    """
    if hasattr(instance, 'profile'):
        instance.profile.save()
