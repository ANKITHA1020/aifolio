"""
Resume parsing service using NLP and AI
"""
import PyPDF2
import pdfplumber
from docx import Document
from typing import Dict, Any, List
from .gemini_client import gemini_client as openai_client


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from PDF file
    
    Args:
        file_path: Path to PDF file
    
    Returns:
        Extracted text
    """
    try:
        # Try pdfplumber first (better for tables)
        with pdfplumber.open(file_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() or ""
            return text
    except Exception:
        # Fallback to PyPDF2
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text()
                return text
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_docx(file_path: str) -> str:
    """
    Extract text from DOCX file
    
    Args:
        file_path: Path to DOCX file
    
    Returns:
        Extracted text
    """
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        raise Exception(f"Failed to extract text from DOCX: {str(e)}")


def parse_resume_file(file_path: str, file_type: str) -> Dict[str, Any]:
    """
    Parse resume file and extract structured data
    
    Args:
        file_path: Path to resume file
        file_type: File type ('pdf' or 'docx')
    
    Returns:
        Dictionary with structured resume data
    """
    # Extract raw text
    if file_type.lower() == 'pdf':
        raw_text = extract_text_from_pdf(file_path)
    elif file_type.lower() in ['docx', 'doc']:
        raw_text = extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")
    
    # Use AI to extract structured data
    if openai_client.is_configured():
        prompt = f"""
        Extract structured information from the following resume text.
        Return a JSON object with the following structure:
        {{
            "name": "Full Name",
            "email": "email@example.com",
            "phone": "Phone number",
            "location": "City, State/Country",
            "summary": "Professional summary",
            "experience": [
                {{
                    "title": "Job Title",
                    "company": "Company Name",
                    "start_date": "Start date (YYYY-MM format if possible)",
                    "end_date": "End date (YYYY-MM format) or 'Present'",
                    "description": "Job description"
                }}
            ],
            "education": [
                {{
                    "degree": "Degree",
                    "institution": "Institution Name",
                    "year": "Graduation year (YYYY)"
                }}
            ],
            "skills": ["skill1", "skill2"],
            "certifications": [
                {{
                    "name": "Certification Name",
                    "issuer": "Issuing Organization",
                    "date": "Date obtained (YYYY-MM if available)",
                    "expiry": "Expiry date (YYYY-MM) or null if not applicable"
                }}
            ]
        }}
        
        Important:
        - Parse dates in YYYY-MM format when possible
        - Extract all certifications with full details
        - Include all skills mentioned
        - Be thorough with experience and education dates
        
        Resume text:
        {raw_text[:4000]}
        """
        
        structured_data = openai_client.generate_json(prompt)
        if structured_data.get("status") != "error":
            return {
                "raw_text": raw_text,
                "structured_data": structured_data
            }
    
    # Fallback: Basic parsing without AI
    return {
        "raw_text": raw_text,
        "structured_data": {
            "name": "",
            "email": "",
            "phone": "",
            "location": "",
            "summary": raw_text[:500] if len(raw_text) > 500 else raw_text,
            "experience": [],
            "education": [],
            "skills": [],
            "certifications": []
        }
    }

