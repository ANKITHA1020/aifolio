"""
SEO analysis service using AI
"""
from typing import Dict, Any
from .gemini_client import gemini_client as openai_client


def analyze_seo(portfolio_content: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze portfolio content for SEO
    
    Args:
        portfolio_content: Dictionary with portfolio content (title, description, keywords, etc.)
    
    Returns:
        Dictionary with SEO analysis and recommendations
    """
    # Basic analysis without AI
    title = portfolio_content.get('title', '')
    description = portfolio_content.get('description', '')
    keywords = portfolio_content.get('keywords', '')
    content_text = portfolio_content.get('content_text', '')
    
    recommendations = []
    score = 100
    
    # Check title
    if not title:
        recommendations.append({
            "type": "meta_title",
            "message": "Missing SEO title",
            "priority": "high"
        })
        score -= 20
    elif len(title) < 30:
        recommendations.append({
            "type": "meta_title",
            "message": "SEO title is too short (recommended: 30-60 characters)",
            "priority": "medium"
        })
        score -= 5
    elif len(title) > 60:
        recommendations.append({
            "type": "meta_title",
            "message": "SEO title is too long (recommended: 30-60 characters)",
            "priority": "medium"
        })
        score -= 5
    
    # Check description
    if not description:
        recommendations.append({
            "type": "meta_description",
            "message": "Missing meta description",
            "priority": "high"
        })
        score -= 15
    elif len(description) < 120:
        recommendations.append({
            "type": "meta_description",
            "message": "Meta description is too short (recommended: 120-160 characters)",
            "priority": "medium"
        })
        score -= 5
    elif len(description) > 160:
        recommendations.append({
            "type": "meta_description",
            "message": "Meta description is too long (recommended: 120-160 characters)",
            "priority": "medium"
        })
        score -= 5
    
    # Check keywords
    if not keywords:
        recommendations.append({
            "type": "meta_keywords",
            "message": "Missing meta keywords",
            "priority": "low"
        })
        score -= 5
    
    # Check content length
    if len(content_text) < 300:
        recommendations.append({
            "type": "content_length",
            "message": "Content is too short (recommended: at least 300 words)",
            "priority": "medium"
        })
        score -= 10
    
    # Calculate keyword density (basic)
    keyword_density = {}
    if keywords and content_text:
        keyword_list = keywords.split(',')
        content_lower = content_text.lower()
        for keyword in keyword_list:
            keyword = keyword.strip().lower()
            if keyword:
                count = content_lower.count(keyword)
                density = (count / len(content_text.split())) * 100 if content_text else 0
                keyword_density[keyword] = round(density, 2)
    
    # Check image alt text (if provided)
    image_alt_info = portfolio_content.get('image_alt_text', {})
    
    # Check links (if provided)
    links_info = portfolio_content.get('links', {'internal': 0, 'external': 0})
    
    # Calculate readability score (basic)
    readability_score = 70  # Placeholder
    
    if openai_client.is_configured():
        prompt = f"""
        Analyze the following portfolio content for SEO and provide detailed recommendations:
        
        Title: {title}
        Description: {description}
        Keywords: {keywords}
        Content Length: {len(content_text)} characters
        
        Return a JSON object with:
        {{
            "score": 0-100,
            "recommendations": [
                {{"type": "category", "message": "recommendation text", "priority": "high|medium|low"}}
            ],
            "keyword_density": {{"keyword": density_value}},
            "readability_score": 0-100
        }}
        """
        
        result = openai_client.generate_json(prompt)
        if isinstance(result, dict):
            # Merge AI recommendations with basic checks
            if 'recommendations' in result:
                recommendations.extend(result['recommendations'])
            if 'readability_score' in result:
                readability_score = result['readability_score']
            if 'keyword_density' in result:
                keyword_density.update(result['keyword_density'])
            if 'score' in result:
                score = result['score']
    
    return {
        "score": max(0, min(100, score)),
        "recommendations": recommendations,
        "keyword_density": keyword_density,
        "meta_tags": {
            "title": bool(title),
            "description": bool(description),
            "keywords": bool(keywords)
        },
        "content_length": len(content_text),
        "readability_score": readability_score,
        "image_alt_text": image_alt_info,
        "links": links_info
    }

