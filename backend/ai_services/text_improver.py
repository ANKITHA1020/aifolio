"""
Text improvement service using AI
"""
from typing import Optional
from .gemini_client import gemini_client as openai_client


def improve_text(
    text: str,
    tone: str = "professional",
    purpose: str = "portfolio",
    improve_grammar: bool = True,
    improve_seo: bool = False
) -> str:
    """
    Improve text using AI (grammar, tone, SEO)
    
    Args:
        text: Original text
        tone: Desired tone (professional, casual, creative, etc.)
        purpose: Purpose of text (portfolio, blog, resume, etc.)
        improve_grammar: Whether to fix grammar
        improve_seo: Whether to optimize for SEO
    
    Returns:
        Improved text
    """
    if not openai_client.is_configured():
        return f"[AI Improved - Placeholder]\n{text}"
    
    improvements = []
    if improve_grammar:
        improvements.append("fix any grammar and spelling errors")
    if improve_seo:
        improvements.append("optimize for SEO with relevant keywords")
    
    improvements_str = ", ".join(improvements) if improvements else "enhance the writing"
    
    prompt = f"""
    Improve the following text for a {purpose}.
    Tone: {tone}
    Please {improvements_str} while maintaining the original meaning and message.
    
    Original text:
    {text}
    
    Return only the improved text, without explanations or markdown formatting.
    """
    
    return openai_client.generate_text(prompt, max_tokens=1000, temperature=0.7)

