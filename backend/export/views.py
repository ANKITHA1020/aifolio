from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from django.template.loader import render_to_string
from django.utils import timezone
from portfolios.models import Portfolio
from portfolios.serializers import PortfolioSerializer
from .models import ExportJob
import os
import zipfile
import tempfile
import platform
import logging
import base64
import mimetypes
from urllib.parse import urlparse
from django.conf import settings
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)


# Cache for WeasyPrint availability check
_weasyprint_available = None
_weasyprint_error = None


def check_weasyprint_availability():
    """
    Check if WeasyPrint is available and can generate PDFs.
    Returns (is_available: bool, error_message: str or None, error_type: str or None)
    """
    global _weasyprint_available, _weasyprint_error
    
    # Return cached result if available
    if _weasyprint_available is not None:
        return _weasyprint_available, _weasyprint_error, None
    
    # Try to import WeasyPrint
    try:
        from weasyprint import HTML
    except ImportError as e:
        error_msg = (
            "WeasyPrint is not installed. "
            "Please install it using: pip install weasyprint"
        )
        _weasyprint_available = False
        _weasyprint_error = error_msg
        logger.error(f"WeasyPrint import failed: {str(e)}")
        return False, error_msg, "import_error"
    
    # Try to generate a simple test PDF
    try:
        test_html = "<html><body><h1>Test</h1></body></html>"
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=True) as tmp_file:
            HTML(string=test_html).write_pdf(tmp_file.name)
        
        _weasyprint_available = True
        _weasyprint_error = None
        logger.info("WeasyPrint availability check passed")
        return True, None, None
        
    except Exception as e:
        error_str = str(e).lower()
        error_type = "runtime_error"
        error_msg = None
        
        # Detect common system dependency issues
        system = platform.system().lower()
        
        if 'cairo' in error_str or 'pango' in error_str or 'gobject' in error_str:
            if system == 'windows':
                error_msg = (
                    "WeasyPrint system dependencies are missing. "
                    "On Windows, you need to install GTK3 runtime libraries. "
                    "Please visit: https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer "
                    "or use: pip install weasyprint[windows]"
                )
                error_type = "system_dependencies_windows"
            elif system == 'linux':
                error_msg = (
                    "WeasyPrint system dependencies are missing. "
                    "Please install system packages: "
                    "sudo apt-get install python3-cffi python3-brotli libpango-1.0-0 libpangoft2-1.0-0 "
                    "or: sudo yum install pango pango-devel cairo cairo-devel"
                )
                error_type = "system_dependencies_linux"
            elif system == 'darwin':  # macOS
                error_msg = (
                    "WeasyPrint system dependencies are missing. "
                    "Please install using Homebrew: "
                    "brew install cairo pango gdk-pixbuf libffi"
                )
                error_type = "system_dependencies_macos"
            else:
                error_msg = (
                    f"WeasyPrint system dependencies are missing (Cairo/Pango). "
                    f"Error: {str(e)}. "
                    f"Please refer to WeasyPrint installation documentation: "
                    f"https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#installation"
                )
                error_type = "system_dependencies"
        elif 'font' in error_str or 'ttf' in error_str:
            error_msg = (
                "WeasyPrint font configuration issue. "
                f"Error: {str(e)}. "
                "Please check your system font configuration."
            )
            error_type = "font_error"
        else:
            error_msg = (
                f"WeasyPrint PDF generation failed. "
                f"Error: {str(e)}. "
                "Please check the server logs for more details."
            )
            error_type = "runtime_error"
        
        _weasyprint_available = False
        _weasyprint_error = error_msg
        logger.error(f"WeasyPrint availability check failed: {str(e)}", exc_info=True)
        return False, error_msg, error_type


def get_platform_specific_instructions():
    """Get platform-specific installation instructions"""
    system = platform.system().lower()
    
    if system == 'windows':
        return {
            'title': 'Windows Installation',
            'instructions': [
                '1. Install GTK3 runtime: Download from https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer',
                '2. Or use: pip install weasyprint[windows]',
                '3. Restart the Django server after installation',
            ],
            'docs_url': 'https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#windows'
        }
    elif system == 'linux':
        return {
            'title': 'Linux Installation',
            'instructions': [
                'Debian/Ubuntu: sudo apt-get install python3-cffi python3-brotli libpango-1.0-0 libpangoft2-1.0-0',
                'RedHat/CentOS: sudo yum install pango pango-devel cairo cairo-devel',
                'Then: pip install weasyprint',
            ],
            'docs_url': 'https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#gnu-linux'
        }
    elif system == 'darwin':
        return {
            'title': 'macOS Installation',
            'instructions': [
                'Install using Homebrew:',
                'brew install cairo pango gdk-pixbuf libffi',
                'Then: pip install weasyprint',
            ],
            'docs_url': 'https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#macos'
        }
    else:
        return {
            'title': 'Installation',
            'instructions': [
                'Please refer to WeasyPrint documentation for your platform',
            ],
            'docs_url': 'https://doc.courtbouillon.org/weasyprint/stable/first_steps.html#installation'
        }


def image_to_base64(image_url, request):
    """
    Convert image URL to base64 data URI for offline viewing
    """
    if not image_url:
        return None
    
    try:
        # Handle absolute URLs
        if image_url.startswith('http://') or image_url.startswith('https://'):
            # For external URLs, try to fetch if it's from our domain
            parsed = urlparse(image_url)
            if request and parsed.netloc == request.get_host():
                # It's from our domain, convert to relative path
                image_path = parsed.path
            else:
                # External URL, return as is (will need internet connection)
                return image_url
        else:
            # Relative URL
            image_path = image_url
        
        # Remove leading slash if present
        if image_path.startswith('/'):
            image_path = image_path[1:]
        
        # Try to read from media storage
        if default_storage.exists(image_path):
            with default_storage.open(image_path, 'rb') as f:
                image_data = f.read()
                mime_type, _ = mimetypes.guess_type(image_path)
                if not mime_type:
                    mime_type = 'image/jpeg'  # Default
                base64_data = base64.b64encode(image_data).decode('utf-8')
                return f"data:{mime_type};base64,{base64_data}"
        else:
            # If file doesn't exist in storage, try to build absolute URL
            if request:
                return request.build_absolute_uri(image_url)
            return image_url
    except Exception as e:
        logger.warning(f"Failed to convert image to base64: {image_url}, error: {str(e)}")
        # Fallback to original URL
        if request:
            try:
                return request.build_absolute_uri(image_url)
            except:
                return image_url
        return image_url


def get_portfolio_context(portfolio, request):
    """
    Get portfolio data organized by component type for template rendering
    Includes all components sorted by order
    """
    # Get portfolio with all components
    serializer = PortfolioSerializer(portfolio, context={'request': request})
    portfolio_data = serializer.data
    
    # Get all components and filter visible ones
    all_components = portfolio_data.get('components', [])
    visible_components = [
        comp for comp in all_components 
        if comp.get('is_visible', True)
    ]
    
    # Sort components by order
    visible_components.sort(key=lambda x: x.get('order', 0))
    
    # Convert image URLs to base64 for offline viewing
    # Handle profile photos
    if portfolio_data.get('profile_photo_url'):
        portfolio_data['profile_photo_url'] = image_to_base64(
            portfolio_data['profile_photo_url'], request
        )
    if portfolio_data.get('user_profile_photo_url'):
        portfolio_data['user_profile_photo_url'] = image_to_base64(
            portfolio_data['user_profile_photo_url'], request
        )
    
    # Convert images in component content
    for component in visible_components:
        content = component.get('content', {})
        if isinstance(content, dict):
            # Handle various image fields
            image_fields = ['image', 'background_image', 'photo', 'avatar', 'featured_image']
            for field in image_fields:
                if field in content and content[field]:
                    content[field] = image_to_base64(content[field], request)
            
            # Handle nested structures (projects, posts, etc.)
            if 'projects' in content and isinstance(content['projects'], list):
                for project in content['projects']:
                    if isinstance(project, dict) and 'image' in project:
                        project['image'] = image_to_base64(project.get('image'), request)
            
            if 'posts' in content and isinstance(content['posts'], list):
                for post in content['posts']:
                    if isinstance(post, dict) and 'featured_image' in post:
                        post['featured_image'] = image_to_base64(post.get('featured_image'), request)
            
            if 'experiences' in content and isinstance(content['experiences'], list):
                for exp in content['experiences']:
                    if isinstance(exp, dict) and 'image' in exp:
                        exp['image'] = image_to_base64(exp.get('image'), request)
            
            if 'testimonials' in content and isinstance(content['testimonials'], list):
                for testimonial in content['testimonials']:
                    if isinstance(testimonial, dict) and 'avatar' in testimonial:
                        testimonial['avatar'] = image_to_base64(testimonial.get('avatar'), request)
    
    # Map component types for backward compatibility
    components_by_type = {}
    for component in visible_components:
        comp_type = component.get('component_type')
        if comp_type:
            # Map new types to legacy types for template compatibility
            type_mapping = {
                'hero_banner': 'header',
                'about_me_card': 'about',
                'skills_cloud': 'skills',
                'project_grid': 'projects',
                'blog_preview_grid': 'blog',
                'contact_form': 'contact',
            }
            legacy_type = type_mapping.get(comp_type, comp_type)
            # Store both new and legacy type mappings
            components_by_type[comp_type] = component
            if legacy_type != comp_type:
                components_by_type[legacy_type] = component
    
    # Extract specific components for backward compatibility
    header_component = components_by_type.get('header') or components_by_type.get('hero_banner')
    about_component = components_by_type.get('about') or components_by_type.get('about_me_card')
    skills_component = components_by_type.get('skills') or components_by_type.get('skills_cloud')
    projects_component = components_by_type.get('projects') or components_by_type.get('project_grid')
    blog_component = components_by_type.get('blog') or components_by_type.get('blog_preview_grid')
    contact_component = components_by_type.get('contact') or components_by_type.get('contact_form')
    
    # Normalize contact component to handle nested social links
    if contact_component and contact_component.get('content'):
        content = contact_component['content']
        # Flatten social links if they exist in a nested structure
        if isinstance(content, dict):
            social = content.get('social', {})
            if social:
                # Copy social links to top level if they don't already exist
                if not content.get('github') and social.get('github'):
                    content['github'] = social['github']
                if not content.get('linkedin') and social.get('linkedin'):
                    content['linkedin'] = social['linkedin']
                if not content.get('website') and social.get('website'):
                    content['website'] = social['website']
    
    # Check if there's a footer component
    has_footer = any(comp.get('component_type') == 'footer' for comp in visible_components)
    
    return {
        'portfolio': portfolio_data,
        'components': visible_components,  # All components in order
        'has_footer': has_footer,
        'header_component': header_component,
        'about_component': about_component,
        'skills_component': skills_component,
        'projects_component': projects_component,
        'blog_component': blog_component,
        'contact_component': contact_component,
        'export_date': timezone.now(),
    }


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_html(request, portfolio_id):
    """
    Export portfolio as HTML/CSS/JS bundle
    """
    portfolio = get_object_or_404(Portfolio, pk=portfolio_id, user=request.user)
    
    # Create export job
    job = ExportJob.objects.create(
        user=request.user,
        portfolio=portfolio,
        export_type='html',
        status='processing'
    )
    
    try:
        # Get portfolio context for template
        context = get_portfolio_context(portfolio, request)
        
        # Render HTML template
        html_content = render_to_string('export/portfolio_html.html', context, request=request)
        
        # Create temporary directory
        with tempfile.TemporaryDirectory() as tmpdir:
            # Write HTML file
            html_file = os.path.join(tmpdir, 'index.html')
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(html_content)
            
            # Create ZIP file
            zip_path = os.path.join(tmpdir, f'portfolio_{portfolio.id}.zip')
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(html_file, 'index.html')
            
            # Save to media directory
            export_dir = os.path.join(settings.MEDIA_ROOT, 'exports')
            os.makedirs(export_dir, exist_ok=True)
            file_path = os.path.join(export_dir, f'portfolio_{portfolio.id}_{job.id}.zip')
            
            with open(zip_path, 'rb') as src, open(file_path, 'wb') as dst:
                dst.write(src.read())
            
            # Update job
            job.status = 'completed'
            job.file_path = file_path
            job.completed_at = timezone.now()
            job.save()
            
            return Response({
                'job_id': job.id,
                'status': 'completed',
                'message': 'Export completed successfully'
            })
    
    except Exception as e:
        import traceback
        error_msg = str(e)
        traceback.print_exc()
        job.status = 'failed'
        job.error_message = error_msg
        job.save()
        return Response(
            {'error': error_msg},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_pdf(request, portfolio_id):
    """
    Export portfolio as PDF using WeasyPrint
    """
    portfolio = get_object_or_404(Portfolio, pk=portfolio_id, user=request.user)
    
    # Create export job
    job = ExportJob.objects.create(
        user=request.user,
        portfolio=portfolio,
        export_type='pdf',
        status='processing'
    )
    
    try:
        # Check if WeasyPrint is available and can generate PDFs
        is_available, error_msg, error_type = check_weasyprint_availability()
        
        if not is_available:
            # Get platform-specific instructions
            instructions = get_platform_specific_instructions()
            
            # Create detailed error message
            detailed_error = {
                'error': error_msg,
                'error_type': error_type,
                'platform': platform.system(),
                'instructions': instructions,
                'suggestion': 'Please install WeasyPrint and its system dependencies, then restart the server.'
            }
            
            job.status = 'failed'
            job.error_message = error_msg
            job.save()
            
            logger.error(f"PDF export failed - WeasyPrint not available: {error_msg} (type: {error_type})")
            
            return Response(
                {
                    'error': error_msg,
                    'error_type': error_type,
                    'instructions': instructions,
                    'job_id': job.id,
                    'status': 'failed'
                },
                status=status.HTTP_501_NOT_IMPLEMENTED
            )
        
        # Import WeasyPrint (we know it's available from the check)
        from weasyprint import HTML
        
        # Get portfolio context for template
        context = get_portfolio_context(portfolio, request)
        
        # Render PDF template
        html_content = render_to_string('export/portfolio_pdf.html', context, request=request)
        
        # Create temporary directory
        with tempfile.TemporaryDirectory() as tmpdir:
            # Generate PDF
            pdf_path = os.path.join(tmpdir, f'portfolio_{portfolio.id}.pdf')
            
            try:
                # Convert HTML to PDF
                # Use base_url to handle relative URLs for images
                base_url = request.build_absolute_uri('/') if request else None
                
                logger.info(f"Generating PDF for portfolio {portfolio.id}")
                HTML(string=html_content, base_url=base_url).write_pdf(pdf_path)
                logger.info(f"PDF generated successfully: {pdf_path}")
                
            except Exception as pdf_error:
                # Handle PDF generation errors specifically
                error_str = str(pdf_error).lower()
                error_detail = str(pdf_error)
                
                if 'image' in error_str or 'url' in error_str:
                    error_msg = (
                        f"PDF generation failed while processing images or external resources. "
                        f"Error: {error_detail}. "
                        "This may be due to inaccessible image URLs or network issues."
                    )
                elif 'css' in error_str or 'stylesheet' in error_str:
                    error_msg = (
                        f"PDF generation failed while processing CSS. "
                        f"Error: {error_detail}. "
                        "Please check the template CSS for compatibility with WeasyPrint."
                    )
                elif 'font' in error_str:
                    error_msg = (
                        f"PDF generation failed due to font issues. "
                        f"Error: {error_detail}. "
                        "Please check your system font configuration."
                    )
                else:
                    error_msg = (
                        f"PDF generation failed. "
                        f"Error: {error_detail}. "
                        "Please check the server logs for more details."
                    )
                
                logger.error(f"PDF generation error for portfolio {portfolio.id}: {error_detail}", exc_info=True)
                
                job.status = 'failed'
                job.error_message = error_msg
                job.save()
                
                return Response(
                    {
                        'error': error_msg,
                        'error_type': 'pdf_generation_error',
                        'job_id': job.id,
                        'status': 'failed'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Save to media directory
            export_dir = os.path.join(settings.MEDIA_ROOT, 'exports')
            os.makedirs(export_dir, exist_ok=True)
            file_path = os.path.join(export_dir, f'portfolio_{portfolio.id}_{job.id}.pdf')
            
            try:
                with open(pdf_path, 'rb') as src, open(file_path, 'wb') as dst:
                    dst.write(src.read())
                
                # Verify file was created and has content
                if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
                    raise Exception("Generated PDF file is empty or was not created")
                
                logger.info(f"PDF saved to: {file_path} (size: {os.path.getsize(file_path)} bytes)")
                
            except Exception as file_error:
                error_msg = f"Failed to save PDF file: {str(file_error)}"
                logger.error(f"File save error: {error_msg}", exc_info=True)
                
                job.status = 'failed'
                job.error_message = error_msg
                job.save()
                
                return Response(
                    {
                        'error': error_msg,
                        'error_type': 'file_save_error',
                        'job_id': job.id,
                        'status': 'failed'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Update job
            job.status = 'completed'
            job.file_path = file_path
            job.completed_at = timezone.now()
            job.save()
            
            logger.info(f"PDF export completed successfully for portfolio {portfolio.id}, job {job.id}")
            
            return Response({
                'job_id': job.id,
                'status': 'completed',
                'message': 'PDF export completed successfully'
            })
    
    except Exception as e:
        # Catch-all for any unexpected errors
        import traceback
        error_detail = str(e)
        traceback_str = traceback.format_exc()
        
        logger.error(f"Unexpected error in PDF export for portfolio {portfolio.id}: {error_detail}\n{traceback_str}")
        
        error_msg = (
            f"An unexpected error occurred during PDF export. "
            f"Error: {error_detail}. "
            "Please check the server logs for more details."
        )
        
        job.status = 'failed'
        job.error_message = error_msg
        job.save()
        
        return Response(
            {
                'error': error_msg,
                'error_type': 'unexpected_error',
                'job_id': job.id,
                'status': 'failed'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_job_detail(request, job_id):
    """
    Get export job details
    """
    job = get_object_or_404(ExportJob, pk=job_id, user=request.user)
    
    response_data = {
        'id': job.id,
        'status': job.status,
        'export_type': job.export_type,
        'file_path': job.file_path,
        'error_message': job.error_message,
        'created_at': job.created_at.isoformat(),
        'completed_at': job.completed_at.isoformat() if job.completed_at else None,
    }
    
    # If job failed and is a PDF export, provide detailed error information
    if job.status == 'failed' and job.export_type == 'pdf' and job.error_message:
        # Check if it's a WeasyPrint-related error
        error_msg_lower = job.error_message.lower()
        if ('weasyprint' in error_msg_lower or 
            'not installed' in error_msg_lower or 
            'system dependencies' in error_msg_lower or
            'cairo' in error_msg_lower or 
            'pango' in error_msg_lower):
            
            # Check WeasyPrint availability to get detailed error info
            is_available, detailed_error, error_type = check_weasyprint_availability()
            
            if not is_available and detailed_error:
                response_data['error_type'] = error_type
                response_data['instructions'] = get_platform_specific_instructions()
    
    return Response(response_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_export(request, job_id):
    """
    Download exported file
    """
    job = get_object_or_404(ExportJob, pk=job_id, user=request.user)
    
    if job.status != 'completed' or not job.file_path:
        raise Http404("Export not ready")
    
    if not os.path.exists(job.file_path):
        raise Http404("Export file not found")
    
    # Determine file extension and MIME type based on export type
    if job.export_type == 'pdf':
        filename = f'{job.portfolio.title.replace(" ", "_")}_portfolio.pdf'
        content_type = 'application/pdf'
    else:
        filename = f'{job.portfolio.title.replace(" ", "_")}_portfolio.zip'
        content_type = 'application/zip'
    
    response = FileResponse(
        open(job.file_path, 'rb'),
        content_type=content_type,
        as_attachment=True,
        filename=filename
    )
    return response
