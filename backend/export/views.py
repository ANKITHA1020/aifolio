from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from portfolios.models import Portfolio
from .models import ExportJob
import os
import zipfile
import tempfile
from django.conf import settings


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
        # Generate HTML content (simplified - in production, use proper template rendering)
        html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{portfolio.title}</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }}
        .portfolio-container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        h1 {{ color: #333; }}
    </style>
</head>
<body>
    <div class="portfolio-container">
        <h1>{portfolio.title}</h1>
        <!-- Portfolio content would be rendered here -->
    </div>
</body>
</html>
"""
        
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
            job.save()
            
            return Response({
                'job_id': job.id,
                'status': 'completed',
                'message': 'Export completed successfully'
            })
    
    except Exception as e:
        job.status = 'failed'
        job.error_message = str(e)
        job.save()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def export_pdf(request, portfolio_id):
    """
    Export portfolio as PDF
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
        # For now, return a placeholder
        # In production, use weasyprint or reportlab to generate PDF
        job.status = 'failed'
        job.error_message = 'PDF export not yet implemented. Please install weasyprint or reportlab.'
        job.save()
        
        return Response(
            {'error': 'PDF export requires additional dependencies'},
            status=status.HTTP_501_NOT_IMPLEMENTED
        )
    
    except Exception as e:
        job.status = 'failed'
        job.error_message = str(e)
        job.save()
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_job_detail(request, job_id):
    """
    Get export job details
    """
    job = get_object_or_404(ExportJob, pk=job_id, user=request.user)
    
    return Response({
        'id': job.id,
        'status': job.status,
        'file_path': job.file_path,
        'error_message': job.error_message,
        'created_at': job.created_at.isoformat(),
        'completed_at': job.completed_at.isoformat() if job.completed_at else None,
    })


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
    
    return FileResponse(
        open(job.file_path, 'rb'),
        as_attachment=True,
        filename=f'portfolio_export_{job.id}.zip'
    )
