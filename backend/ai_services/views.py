from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from resumes.models import ResumeUpload, ResumeData
from . import resume_parser
from . import content_generator
from . import skill_extractor
from . import text_improver
from . import seo_analyzer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def parse_resume(request):
    """
    Parse uploaded resume and extract structured data
    """
    resume_id = request.data.get('resume_id')
    if not resume_id:
        return Response(
            {'error': 'resume_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        resume_upload = ResumeUpload.objects.get(id=resume_id, user=request.user)
    except ResumeUpload.DoesNotExist:
        return Response(
            {'error': 'Resume not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update status
    resume_upload.status = 'processing'
    resume_upload.save()
    
    try:
        # Determine file type
        file_name = resume_upload.file.name.lower()
        if file_name.endswith('.pdf'):
            file_type = 'pdf'
        elif file_name.endswith(('.docx', '.doc')):
            file_type = 'docx'
        else:
            return Response(
                {'error': 'Unsupported file type'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Parse resume
        parsed_data = resume_parser.parse_resume_file(resume_upload.file.path, file_type)
        
        # Save extracted data
        resume_data, created = ResumeData.objects.get_or_create(
            resume_upload=resume_upload,
            defaults={
                'raw_text': parsed_data['raw_text'],
                'structured_data': parsed_data['structured_data']
            }
        )
        
        if not created:
            resume_data.raw_text = parsed_data['raw_text']
            resume_data.structured_data = parsed_data['structured_data']
            resume_data.save()
        
        # Extract skills
        from resumes.models import ParsedSkill
        ParsedSkill.objects.filter(resume_data=resume_data).delete()
        skills = skill_extractor.extract_skills(parsed_data['raw_text'])
        for skill_data in skills:
            ParsedSkill.objects.create(
                resume_data=resume_data,
                name=skill_data['name'],
                category=skill_data.get('category', 'technical'),
                confidence_score=skill_data.get('confidence', 0.5)
            )
        
        resume_upload.status = 'completed'
        resume_upload.save()
        
        return Response({
            'resume_id': resume_upload.id,
            'structured_data': parsed_data['structured_data'],
            'skills': [
                {
                    'name': skill.name,
                    'category': skill.category,
                    'confidence': skill.confidence_score
                }
                for skill in resume_data.skills.all()
            ]
        })
    
    except Exception as e:
        resume_upload.status = 'failed'
        resume_upload.error_message = str(e)
        resume_upload.save()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_bio(request):
    """
    Generate "About Me" section from resume data
    """
    resume_data_dict = request.data.get('resume_data', {})
    if not resume_data_dict:
        return Response(
            {'error': 'resume_data is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    bio = content_generator.generate_bio(resume_data_dict)
    return Response({'bio': bio})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def extract_skills(request):
    """
    Extract skills from resume text
    """
    resume_text = request.data.get('resume_text', '')
    if not resume_text:
        return Response(
            {'error': 'resume_text is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    skills = skill_extractor.extract_skills(resume_text)
    return Response({'skills': skills})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_project_description(request):
    """
    Generate project description
    """
    project_title = request.data.get('title', '')
    technologies = request.data.get('technologies', [])
    skills = request.data.get('skills', [])
    
    if not project_title:
        return Response(
            {'error': 'title is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    description = content_generator.generate_project_description(
        project_title, technologies, skills
    )
    return Response({'description': description})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def improve_text(request):
    """
    Improve text (grammar, tone, SEO)
    """
    text = request.data.get('text', '')
    if not text:
        return Response(
            {'error': 'text is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    tone = request.data.get('tone', 'professional')
    purpose = request.data.get('purpose', 'portfolio')
    improve_grammar = request.data.get('improve_grammar', True)
    improve_seo = request.data.get('improve_seo', False)
    
    improved_text = text_improver.improve_text(
        text, tone, purpose, improve_grammar, improve_seo
    )
    return Response({'improved_text': improved_text})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_seo(request):
    """
    Analyze portfolio content for SEO
    """
    portfolio_id = request.data.get('portfolio_id')
    if not portfolio_id:
        return Response(
            {'error': 'portfolio_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from portfolios.models import Portfolio
        portfolio = Portfolio.objects.get(pk=portfolio_id, user=request.user)
    except Portfolio.DoesNotExist:
        return Response(
            {'error': 'Portfolio not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Collect portfolio content for analysis
    portfolio_content = {
        'title': portfolio.seo_title or portfolio.title,
        'description': portfolio.seo_description or '',
        'keywords': portfolio.seo_keywords or '',
        'content_text': portfolio.title,  # Basic - could extract from components
        'image_alt_text': {
            'total': 0,
            'with_alt': 0
        },
        'links': {
            'internal': 0,
            'external': 0
        }
    }
    
    # Extract text from components
    content_parts = [portfolio.title]
    for component in portfolio.components.all():
        if component.is_visible:
            content_parts.append(str(component.content))
    portfolio_content['content_text'] = ' '.join(content_parts)
    
    analysis = seo_analyzer.analyze_seo(portfolio_content)
    return Response(analysis)
