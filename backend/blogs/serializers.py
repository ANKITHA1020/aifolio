from rest_framework import serializers
from .models import BlogPost, BlogTag, BlogCategory


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name']
        read_only_fields = ['id']


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class BlogPostSerializer(serializers.ModelSerializer):
    tags = BlogTagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text="List of tag names to assign"
    )
    category_name = serializers.CharField(source='category.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'user', 'user_email', 'title', 'slug', 'content_markdown',
            'excerpt', 'featured_image', 'category', 'category_name',
            'tags', 'tag_names', 'published', 'published_date', 'views',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'slug', 'views', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        validated_data['user'] = self.context['request'].user
        post = super().create(validated_data)
        
        # Create or get tags
        for tag_name in tag_names:
            tag, _ = BlogTag.objects.get_or_create(name=tag_name.strip())
            post.tags.add(tag)
        
        return post
    
    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        post = super().update(instance, validated_data)
        
        # Update tags if provided
        if tag_names is not None:
            post.tags.clear()
            for tag_name in tag_names:
                tag, _ = BlogTag.objects.get_or_create(name=tag_name.strip())
                post.tags.add(tag)
        
        return post

