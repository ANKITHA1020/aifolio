from rest_framework import serializers
from .models import ResumeUpload, ResumeData, ParsedSkill


class ParsedSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParsedSkill
        fields = ['id', 'name', 'category', 'confidence_score']
        read_only_fields = ['id']


class ResumeDataSerializer(serializers.ModelSerializer):
    skills = ParsedSkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = ResumeData
        fields = ['id', 'raw_text', 'structured_data', 'skills', 'extracted_at', 'updated_at']
        read_only_fields = ['id', 'extracted_at', 'updated_at']


class ResumeUploadSerializer(serializers.ModelSerializer):
    extracted_data = ResumeDataSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = ResumeUpload
        fields = [
            'id', 'user', 'user_email', 'file', 'file_size',
            'uploaded_at', 'status', 'error_message', 'extracted_data'
        ]
        read_only_fields = ['user', 'uploaded_at', 'status', 'error_message']
    
    def get_file_size(self, obj):
        if obj.file:
            try:
                return obj.file.size
            except:
                return None
        return None
    
    def validate_file(self, value):
        # Validate file type
        valid_extensions = ['.pdf', '.docx', '.doc']
        file_name = value.name.lower()
        if not any(file_name.endswith(ext) for ext in valid_extensions):
            raise serializers.ValidationError(
                'File must be a PDF, DOC, or DOCX file.'
            )
        
        # Validate file size (10MB max)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                'File size must be less than 10MB.'
            )
        
        return value
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

