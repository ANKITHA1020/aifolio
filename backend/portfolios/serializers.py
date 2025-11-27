from rest_framework import serializers
from django.db.models import Max
from .models import Portfolio, PortfolioComponent, PortfolioSettings, Template


class TemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Template
        fields = '__all__'


class PortfolioSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioSettings
        fields = '__all__'
        read_only_fields = ['portfolio']


class PortfolioComponentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioComponent
        fields = '__all__'
        read_only_fields = ['portfolio']
    
    def validate(self, attrs):
        # Ensure order is unique within portfolio
        portfolio = self.context.get('portfolio') or (self.instance.portfolio if self.instance else None)
        if portfolio and 'order' in attrs:
            existing = PortfolioComponent.objects.filter(
                portfolio=portfolio,
                order=attrs['order']
            ).exclude(pk=self.instance.pk if self.instance else None)
            if existing.exists():
                # Auto-assign next available order instead of raising error
                max_order = PortfolioComponent.objects.filter(
                    portfolio=portfolio
                ).exclude(pk=self.instance.pk if self.instance else None).aggregate(
                    max_order=Max('order')
                )['max_order'] or -1
                attrs['order'] = max_order + 1
        elif portfolio and 'order' not in attrs:
            # If order not provided, auto-assign next available order
            max_order = PortfolioComponent.objects.filter(
                portfolio=portfolio
            ).exclude(pk=self.instance.pk if self.instance else None).aggregate(
                max_order=Max('order')
            )['max_order'] or -1
            attrs['order'] = max_order + 1
        return attrs


class PortfolioSerializer(serializers.ModelSerializer):
    components = PortfolioComponentSerializer(many=True, read_only=True)
    settings = PortfolioSettingsSerializer(read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    profile_photo_url = serializers.SerializerMethodField()
    user_profile_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'user', 'user_email', 'title', 'slug', 'template', 'template_name',
            'template_type', 'is_published', 'custom_settings', 'components',
            'settings', 'seo_title', 'seo_description', 'seo_keywords',
            'profile_photo', 'profile_photo_url', 'user_profile_photo_url',
            'meta_keywords', 'meta_description', 'pages', 'navigation_enabled',
            'interactive_elements', 'created_at', 'updated_at', 'published_at'
        ]
        read_only_fields = ['user', 'slug', 'created_at', 'updated_at', 'published_at']
    
    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get('request')
            url = obj.profile_photo.url
            if request:
                url = request.build_absolute_uri(url)
            # Add cache-busting parameter using updated_at timestamp
            if obj.updated_at:
                separator = '&' if '?' in url else '?'
                url = f"{url}{separator}v={obj.updated_at.timestamp()}"
            return url
        return None
    
    def get_user_profile_photo_url(self, obj):
        """Fallback to user profile photo if portfolio photo not set"""
        try:
            if obj.user.profile and obj.user.profile.photo:
                request = self.context.get('request')
                url = obj.user.profile.photo.url
                if request:
                    url = request.build_absolute_uri(url)
                # Add cache-busting parameter using user profile updated_at timestamp
                if hasattr(obj.user.profile, 'updated_at') and obj.user.profile.updated_at:
                    separator = '&' if '?' in url else '?'
                    url = f"{url}{separator}v={obj.user.profile.updated_at.timestamp()}"
                return url
        except:
            pass
        return None
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        portfolio = super().create(validated_data)
        
        # Create default settings
        PortfolioSettings.objects.create(portfolio=portfolio)
        
        return portfolio


class PortfolioListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'title', 'slug', 'template_type', 'is_published',
            'user_email', 'template_name', 'created_at', 'updated_at'
        ]

