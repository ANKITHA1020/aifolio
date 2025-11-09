"""
Skill extraction service using AI
"""
from typing import List, Dict, Any
from .gemini_client import gemini_client as openai_client


def extract_skills(resume_text: str) -> List[Dict[str, Any]]:
    """
    Extract and classify skills from resume text
    
    Args:
        resume_text: Resume text content
    
    Returns:
        List of dictionaries with skill information
        Format: [{"name": "skill_name", "category": "technical|soft|language|framework|tool|other", "confidence": 0.0-1.0}]
    """
    if not openai_client.is_configured():
        # Basic keyword matching (placeholder)
        technical_keywords = [
            "python", "javascript", "react", "django", "node", "sql", "html", "css",
            "java", "c++", "git", "docker", "aws", "linux", "api", "rest", "graphql"
        ]
        found_skills = []
        resume_lower = resume_text.lower()
        for keyword in technical_keywords:
            if keyword in resume_lower:
                found_skills.append({
                    "name": keyword.title(),
                    "category": "technical",
                    "confidence": 0.6
                })
        return found_skills[:20]  # Limit to 20 skills
    
    prompt = f"""
    Extract and classify technical and non-technical skills from the following resume text.
    
    Return a JSON array of skills in this format:
    [
        {{
            "name": "Skill Name",
            "category": "technical|soft|language|framework|tool|other",
            "confidence": 0.0-1.0
        }}
    ]
    
    Categories:
    - technical: Programming languages, technologies (Python, JavaScript, etc.)
    - soft: Soft skills (Communication, Leadership, etc.)
    - language: Natural languages (English, Spanish, etc.)
    - framework: Frameworks and libraries (React, Django, etc.)
    - tool: Tools and platforms (Git, Docker, AWS, etc.)
    - other: Other skills
    
    Resume text:
    {resume_text[:3000]}
    """
    
    result = openai_client.generate_json(prompt)
    if isinstance(result, list):
        return result
    elif isinstance(result, dict) and "skills" in result:
        return result["skills"]
    else:
        return []

