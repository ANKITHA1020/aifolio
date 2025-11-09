"""
AI content generation service
"""
from typing import Dict, Any
from .gemini_client import gemini_client as openai_client


def generate_bio(resume_data: Dict[str, Any]) -> str:
    """
    Generate "About Me" section from resume data
    
    Args:
        resume_data: Structured resume data
    
    Returns:
        Generated bio text
    """
    if not openai_client.is_configured():
        # Generate a more contextual placeholder bio based on resume data
        name = resume_data.get('name', 'Professional')
        summary = resume_data.get('summary', '')
        skills = resume_data.get('skills', [])
        
        bio = f"""[AI Generated Bio - Placeholder]

I am {name}, a dedicated professional with a passion for excellence.

{summary if summary else 'With a strong foundation in technology and a commitment to continuous learning, I strive to deliver impactful solutions.'}

My expertise spans across {', '.join(skills[:5]) if skills else 'various technologies'}, and I am always eager to take on new challenges and contribute to innovative projects.

To enable AI-powered bio generation, please add your GEMINI_API_KEY to the backend/.env file.
"""
        return bio
    
    prompt = f"""
    Create a professional "About Me" section for a portfolio based on the following resume information:
    
    Name: {resume_data.get('name', 'Professional')}
    Summary: {resume_data.get('summary', '')}
    Experience: {resume_data.get('experience', [])}
    Skills: {resume_data.get('skills', [])}
    
    Write a compelling, professional biography (2-3 paragraphs) that:
    - Highlights key achievements and experiences
    - Shows personality and passion
    - Is engaging and professional
    - Suitable for a portfolio website
    """
    
    return openai_client.generate_text(prompt, max_tokens=500)


def generate_project_description(
    project_title: str,
    technologies: list,
    skills: list
) -> str:
    """
    Generate project description based on title and skills
    
    Args:
        project_title: Title of the project
        technologies: List of technologies used
        skills: List of relevant skills
    
    Returns:
        Generated project description
    """
    if not openai_client.is_configured():
        return f"""
        [AI Generated Description - Placeholder]
        {project_title} is an innovative project that leverages modern technologies
        to deliver exceptional user experiences. Built with {', '.join(technologies[:3]) if technologies else 'cutting-edge tools'},
        this project showcases expertise in {', '.join(skills[:3]) if skills else 'various domains'}.
        """
    
    prompt = f"""
    Write a compelling project description for: {project_title}
    
    Technologies used: {', '.join(technologies) if technologies else 'Modern web technologies'}
    Skills demonstrated: {', '.join(skills) if skills else 'Software development'}
    
    Create a professional description (3-5 sentences) that:
    - Explains what the project does and its purpose
    - Highlights key features and technologies used
    - Shows the value and impact
    - Mentions technical achievements or challenges overcome
    - Is engaging, professional, and suitable for a portfolio
    
    Return only the description text without markdown formatting.
    """
    
    return openai_client.generate_text(prompt, max_tokens=400)


def generate_project_short_description(
    project_title: str,
    technologies: list,
    full_description: str = ""
) -> str:
    """
    Generate a short project description (for preview/excerpt)
    
    Args:
        project_title: Title of the project
        technologies: List of technologies used
        full_description: Optional full description to summarize
    
    Returns:
        Short description (max 300 characters)
    """
    if not openai_client.is_configured():
        tech_str = ', '.join(technologies[:3]) if technologies else 'modern technologies'
        return f"{project_title} - A project built with {tech_str} that delivers exceptional user experiences."
    
    if full_description:
        prompt = f"""
        Create a concise project summary (max 300 characters) for: {project_title}
        
        Full description: {full_description}
        
        Extract the most important points and create a brief, engaging summary.
        """
    else:
        prompt = f"""
        Create a concise project summary (max 300 characters) for: {project_title}
        
        Technologies: {', '.join(technologies) if technologies else 'Modern technologies'}
        
        Write a brief, engaging summary that captures the essence of the project.
        """
    
    result = openai_client.generate_text(prompt, max_tokens=100)
    return result[:300] if result else f"{project_title} - A professional project built with modern technologies."


def generate_project_content(
    project_title: str,
    technologies: list = None,
    skills: list = None
) -> dict:
    """
    Generate both full and short project descriptions
    
    Args:
        project_title: Title of the project
        technologies: List of technologies used
        skills: List of relevant skills
    
    Returns:
        Dictionary with 'description' and 'short_description'
    """
    technologies = technologies or []
    skills = skills or []
    
    # Generate full description
    description = generate_project_description(project_title, technologies, skills)
    
    # Generate short description
    short_description = generate_project_short_description(project_title, technologies, description)
    
    return {
        'description': description,
        'short_description': short_description
    }


def generate_blog_outline(topic: str) -> Dict[str, Any]:
    """
    Generate blog post outline from topic
    
    Args:
        topic: Blog topic
    
    Returns:
        Dictionary with outline structure
    """
    if not openai_client.is_configured():
        return {
            "title": f"Exploring {topic}",
            "sections": [
                {"heading": "Introduction", "content": "Introduction to the topic"},
                {"heading": "Main Points", "content": "Key points to discuss"},
                {"heading": "Conclusion", "content": "Summary and conclusion"}
            ]
        }
    
    prompt = f"""
    Create a comprehensive blog post outline for the topic: {topic}
    
    Return a JSON object with:
    {{
        "title": "Compelling blog post title",
        "sections": [
            {{"heading": "Section heading", "content": "Brief description of section content (2-3 sentences)"}}
        ]
    }}
    
    Requirements:
    - Create 4-6 sections including Introduction and Conclusion
    - Make the title engaging and SEO-friendly
    - Each section should have clear, descriptive content
    - Structure should flow logically
    """
    
    try:
        outline = openai_client.generate_json(prompt)
        if isinstance(outline, dict) and 'sections' in outline:
            return outline
    except:
        pass
    
    return {
        "title": f"Exploring {topic}",
        "sections": [
            {"heading": "Introduction", "content": f"An introduction to {topic} and its importance."},
            {"heading": "Key Concepts", "content": "Understanding the fundamental concepts."},
            {"heading": "Best Practices", "content": "Practical tips and best practices."},
            {"heading": "Conclusion", "content": "Summary and key takeaways."}
        ]
    }


def generate_blog_content(
    topic: str = "",
    title: str = "",
    outline: Dict[str, Any] = None
) -> str:
    """
    Generate full blog post content from topic or outline
    
    Args:
        topic: Blog topic
        title: Blog title
        outline: Optional outline dictionary
    
    Returns:
        Full blog post content in markdown format
    """
    if not openai_client.is_configured():
        if outline and isinstance(outline, dict):
            sections = outline.get('sections', [])
            content = f"# {outline.get('title', title or topic)}\n\n"
            for section in sections:
                content += f"## {section.get('heading', 'Section')}\n\n"
                content += f"{section.get('content', '')}\n\n"
            return content
        return f"# {title or topic}\n\nThis is a blog post about {topic or title}."
    
    # Build prompt based on available information
    if outline and isinstance(outline, dict):
        sections_text = "\n".join([
            f"### {s.get('heading', '')}\n{s.get('content', '')}"
            for s in outline.get('sections', [])
        ])
        prompt = f"""
        Write a comprehensive blog post based on this outline:
        
        Title: {outline.get('title', title or topic)}
        
        Outline:
        {sections_text}
        
        Requirements:
        - Write in Markdown format
        - Expand each section with 2-3 paragraphs of detailed content
        - Use proper headings (## for sections, ### for subsections)
        - Include examples and practical insights
        - Write in a professional yet engaging tone
        - Ensure content is well-structured and flows naturally
        
        Return the complete blog post in Markdown format.
        """
    else:
        prompt = f"""
        Write a comprehensive blog post about: {title or topic}
        
        Requirements:
        - Write in Markdown format
        - Include an introduction, main content (3-4 sections), and conclusion
        - Use proper headings (## for sections, ### for subsections)
        - Include examples and practical insights
        - Write in a professional yet engaging tone
        - Aim for 800-1200 words
        - Ensure content is well-structured and flows naturally
        
        Return the complete blog post in Markdown format.
        """
    
    return openai_client.generate_text(prompt, max_tokens=2000)


def generate_blog_excerpt(content: str, max_length: int = 300) -> str:
    """
    Generate excerpt from blog content
    
    Args:
        content: Blog post content
        max_length: Maximum length of excerpt
    
    Returns:
        Generated excerpt
    """
    if not openai_client.is_configured():
        # Simple extraction: first paragraph or first N characters
        # Remove markdown headers
        text = content.replace('#', '').strip()
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        if paragraphs:
            excerpt = paragraphs[0]
            # Remove markdown formatting
            excerpt = excerpt.replace('**', '').replace('*', '').replace('`', '')
            return excerpt[:max_length] + ('...' if len(excerpt) > max_length else '')
        return content[:max_length] + ('...' if len(content) > max_length else '')
    
    prompt = f"""
    Create a compelling excerpt (max {max_length} characters) for a blog post.
    
    Blog content:
    {content[:1000]}  # First 1000 chars for context
    
    Requirements:
    - Extract the key points and main message
    - Make it engaging and informative
    - Keep it under {max_length} characters
    - Do not include markdown formatting
    - Write in third person
    
    Return only the excerpt text.
    """
    
    result = openai_client.generate_text(prompt, max_tokens=150)
    if result:
        excerpt = result.replace('**', '').replace('*', '').replace('`', '').strip()
        return excerpt[:max_length] + ('...' if len(excerpt) > max_length else '')
    
    # Fallback
    text = content.replace('#', '').strip()
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    if paragraphs:
        excerpt = paragraphs[0].replace('**', '').replace('*', '').replace('`', '')
        return excerpt[:max_length] + ('...' if len(excerpt) > max_length else '')
    return content[:max_length] + ('...' if len(content) > max_length else '')


def improve_blog_content(
    content: str,
    improve_grammar: bool = True,
    improve_seo: bool = False,
    tone: str = "professional"
) -> str:
    """
    Improve blog content (grammar, SEO, tone)
    
    Args:
        content: Original blog content
        improve_grammar: Whether to improve grammar
        improve_seo: Whether to optimize for SEO
        tone: Desired tone (professional, casual, etc.)
    
    Returns:
        Improved blog content
    """
    from .text_improver import improve_text
    
    return improve_text(
        text=content,
        tone=tone,
        purpose="blog",
        improve_grammar=improve_grammar,
        improve_seo=improve_seo
    )

