from rest_framework import serializers
from .models import Project, ProjectTag, ProjectCategory


class ProjectTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTag
        fields = ['id', 'name']
        read_only_fields = ['id']


class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ['id', 'name', 'description']
        read_only_fields = ['id']


class ProjectSerializer(serializers.ModelSerializer):
    tags = ProjectTagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text="List of tag names to assign"
    )
    category_name = serializers.CharField(source='category.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'user', 'user_email', 'title', 'slug', 'description',
            'short_description', 'image', 'category', 'category_name',
            'tags', 'tag_names', 'github_url', 'live_url', 'featured',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'slug', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        validated_data['user'] = self.context['request'].user
        project = super().create(validated_data)
        
        # Create or get tags
        for tag_name in tag_names:
            tag, _ = ProjectTag.objects.get_or_create(name=tag_name.strip())
            project.tags.add(tag)
        
        return project
    
    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        project = super().update(instance, validated_data)
        
        # Update tags if provided
        if tag_names is not None:
            project.tags.clear()
            for tag_name in tag_names:
                tag, _ = ProjectTag.objects.get_or_create(name=tag_name.strip())
                project.tags.add(tag)
        
        return project

