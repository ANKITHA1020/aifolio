"""
Gemini client for AI services (replacing OpenAI)
This module provides a wrapper around Google Gemini API calls
"""
# Import the new Gemini client
from .gemini_client import gemini_client as openai_client

# For backward compatibility, alias the old name
__all__ = ['openai_client']

