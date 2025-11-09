"""
Google Gemini client for AI services
This module provides a wrapper around Google Gemini API calls
"""
import os
from typing import Optional, Dict, Any, List, Tuple
import google.generativeai as genai
from django.conf import settings
import json
import time
import re


class GeminiClient:
    """
    Client for interacting with Google Gemini API
    """
    
    def __init__(self):
        self.api_key = None
        self.model = None
        self.model_name = None
        self._initialized = False
        # Prefer models with better free tier limits
        self.preferred_models = [
            'gemini-1.5-flash',  # Best free tier limits
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-2.0-flash-exp',
        ]
    
    def _get_available_models(self) -> Optional[str]:
        """List available models and return the first usable one, preferring stable models"""
        try:
            models = genai.list_models()
            available_model_names = []
            
            # Collect all available models
            for model in models:
                if 'generateContent' in model.supported_generation_methods:
                    model_name = model.name.replace('models/', '')
                    available_model_names.append(model_name)
            
            # Prefer models from our preferred list (avoid experimental models for free tier)
            for preferred in self.preferred_models:
                if preferred in available_model_names:
                    print(f"Found preferred model: {preferred}")
                    return preferred
            
            # If no preferred model found, return first available (but avoid experimental)
            for model_name in available_model_names:
                if 'exp' not in model_name.lower() and 'experimental' not in model_name.lower():
                    print(f"Found available model: {model_name}")
                    return model_name
            
            # Last resort: return first available
            if available_model_names:
                print(f"Using available model: {available_model_names[0]}")
                return available_model_names[0]
            
            return None
        except Exception as e:
            print(f"Error listing models: {e}")
            return None
    
    def _initialize(self):
        """Initialize API key from settings"""
        if not self._initialized:
            self.api_key = getattr(settings, 'GEMINI_API_KEY', '')
            if self.api_key:
                try:
                    genai.configure(api_key=self.api_key)
                    # List available models and use the first one that supports generateContent
                    available_model = self._get_available_models()
                    if available_model:
                        self.model_name = available_model
                        self.model = genai.GenerativeModel(available_model)
                        print(f"Initialized Gemini with model: {available_model}")
                    else:
                        # Fallback: try preferred model names
                        for model_name in self.preferred_models:
                            try:
                                self.model = genai.GenerativeModel(model_name)
                                self.model_name = model_name
                                print(f"Initialized Gemini with fallback model: {model_name}")
                                break
                            except Exception:
                                continue
                        if not self.model:
                            print("Warning: Could not initialize any Gemini model")
                except Exception as e:
                    print(f"Warning: Failed to initialize Gemini client: {e}")
                    self.model = None
            self._initialized = True
    
    def is_configured(self) -> bool:
        """Check if Gemini is configured"""
        self._initialize()
        return self.api_key is not None and len(self.api_key) > 0 and self.model is not None
    
    def _is_quota_error(self, error: Exception) -> Tuple[bool, Optional[float]]:
        """
        Check if error is a quota/rate limit error and extract retry delay
        
        Returns:
            (is_quota_error, retry_delay_seconds)
        """
        error_str = str(error)
        
        # Check for quota/rate limit indicators
        quota_indicators = [
            '429',
            'quota',
            'rate limit',
            'exceeded',
            'RESOURCE_EXHAUSTED',
        ]
        
        is_quota = any(indicator.lower() in error_str.lower() for indicator in quota_indicators)
        
        if not is_quota:
            return False, None
        
        # Try to extract retry delay from error message
        retry_delay = None
        
        # Look for "retry in X seconds" or similar patterns
        delay_patterns = [
            r'retry.*?(\d+\.?\d*)\s*seconds?',
            r'retry_delay.*?(\d+\.?\d*)',
            r'Please retry in (\d+\.?\d*)s',
        ]
        
        for pattern in delay_patterns:
            match = re.search(pattern, error_str, re.IGNORECASE)
            if match:
                try:
                    retry_delay = float(match.group(1))
                    break
                except (ValueError, IndexError):
                    continue
        
        # Default retry delay if not found
        if retry_delay is None:
            retry_delay = 60.0  # Default to 60 seconds
        
        return True, retry_delay
    
    def _try_fallback_model(self, current_model_name: str) -> Optional[genai.GenerativeModel]:
        """Try to get a fallback model if current one has quota issues"""
        if not current_model_name:
            current_model_name = self.model_name or ""
        
        # Try other preferred models
        for model_name in self.preferred_models:
            if model_name != current_model_name:
                try:
                    model = genai.GenerativeModel(model_name)
                    self.model_name = model_name
                    print(f"Switched to fallback model: {model_name}")
                    return model
                except Exception:
                    continue
        
        return None
    
    def generate_text(
        self,
        prompt: str,
        model: str = "gemini-pro",
        max_tokens: int = 500,
        temperature: float = 0.7,
        max_retries: int = 2
    ) -> str:
        """
        Generate text using Google Gemini with quota error handling and retry logic
        
        Args:
            prompt: The prompt text
            model: Model to use (default: gemini-pro)
            max_tokens: Maximum tokens to generate (Gemini uses max_output_tokens)
            temperature: Sampling temperature (0.0-1.0)
            max_retries: Maximum number of retries for quota errors
        
        Returns:
            Generated text
        """
        if not self.is_configured():
            # Return placeholder response when no API key is configured
            return f"[AI Generated - Placeholder]\nThis is a placeholder response. To enable AI features, please add your GEMINI_API_KEY to the .env file.\n\nBased on your prompt about: {prompt[:100]}..."
        
        self._initialize()
        if not self.api_key:
            return f"[AI Generated - Placeholder]\nGemini API key not configured.\n\nBased on your prompt: {prompt[:100]}..."
        
        # Get model instance
        model_instance = None
        current_model_name = None
        
        if model in ["gemini-pro", "gemini-1.5-flash"] or not model:
            # Use the initialized model
            model_instance = self.model
            current_model_name = self.model_name
        else:
            try:
                model_instance = genai.GenerativeModel(model)
                current_model_name = model
            except Exception:
                # Fallback to default model if specified model fails
                if self.model:
                    model_instance = self.model
                    current_model_name = self.model_name
                else:
                    return f"[AI Generated - Placeholder]\nGemini model '{model}' not available. Please check your API configuration.\n\nBased on your prompt: {prompt[:100]}..."
        
        if not model_instance:
            return f"[AI Error] No Gemini model available. Please check your API key and model configuration."
        
        generation_config = {
            "temperature": temperature,
            "max_output_tokens": max_tokens,
        }
        
        # Retry logic for quota errors
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                response = model_instance.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                return response.text
                
            except Exception as e:
                last_error = e
                is_quota, retry_delay = self._is_quota_error(e)
                
                if is_quota:
                    # Try fallback model first
                    if attempt == 0:
                        fallback_model = self._try_fallback_model(current_model_name)
                        if fallback_model:
                            model_instance = fallback_model
                            current_model_name = self.model_name
                            print(f"Retrying with fallback model after quota error...")
                            continue
                    
                    # If still quota error, wait and retry
                    if attempt < max_retries:
                        wait_time = retry_delay or (60 * (attempt + 1))  # Exponential backoff
                        error_msg = (
                            f"Gemini API quota exceeded. "
                            f"Please check your plan and billing at https://ai.google.dev/gemini-api/docs/rate-limits. "
                            f"Retrying in {wait_time:.1f} seconds... (attempt {attempt + 1}/{max_retries + 1})"
                        )
                        print(f"[AI Warning] {error_msg}")
                        time.sleep(min(wait_time, 120))  # Cap at 2 minutes
                        continue
                    else:
                        # Max retries reached
                        return (
                            f"[AI Error] Gemini API quota exceeded after {max_retries + 1} attempts. "
                            f"Please check your plan and billing details at https://ai.google.dev/gemini-api/docs/rate-limits. "
                            f"To monitor usage: https://ai.dev/usage?tab=rate-limit. "
                            f"Error: {str(e)[:200]}"
                        )
                else:
                    # Non-quota error, return immediately
                    return f"[AI Error] {str(e)}"
        
        # Should not reach here, but handle it
        return f"[AI Error] Failed after {max_retries + 1} attempts: {str(last_error)}"
    
    def generate_json(
        self,
        prompt: str,
        model: str = "gemini-pro",
        max_tokens: int = 1000,
        max_retries: int = 2
    ) -> Dict[str, Any]:
        """
        Generate JSON-structured response with quota error handling
        
        Args:
            prompt: The prompt text
            model: Model to use
            max_tokens: Maximum tokens to generate
            max_retries: Maximum number of retries for quota errors
        
        Returns:
            Dictionary with generated data
        """
        if not self.is_configured():
            return {"status": "placeholder", "data": {}, "message": "Gemini API key not configured"}
        
        self._initialize()
        if not self.api_key:
            return {"status": "placeholder", "data": {}, "message": "Gemini API key not configured"}
        
        # Get model instance
        model_instance = None
        current_model_name = None
        
        if model in ["gemini-pro", "gemini-1.5-flash"] or not model:
            model_instance = self.model
            current_model_name = self.model_name
        else:
            try:
                model_instance = genai.GenerativeModel(model)
                current_model_name = model
            except Exception:
                if self.model:
                    model_instance = self.model
                    current_model_name = self.model_name
                else:
                    return {"status": "error", "error": f"Gemini model '{model}' not available"}
        
        if not model_instance:
            return {"status": "error", "error": "No Gemini model available. Please check your API key and model configuration."}
        
        # Enhance prompt to ensure JSON response
        json_prompt = f"""You are a helpful assistant that returns JSON responses only. 
Return valid JSON format only, no markdown, no code blocks, just pure JSON.

{prompt}

Return your response as a valid JSON object."""
        
        generation_config = {
            "temperature": 0.3,  # Lower temperature for more structured responses
            "max_output_tokens": max_tokens,
        }
        
        # Retry logic for quota errors
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                response = model_instance.generate_content(
                    json_prompt,
                    generation_config=generation_config
                )
                
                # Extract JSON from response
                response_text = response.text.strip()
                
                # Remove markdown code blocks if present
                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.startswith("```"):
                    response_text = response_text[3:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                response_text = response_text.strip()
                
                # Parse JSON
                try:
                    return json.loads(response_text)
                except json.JSONDecodeError:
                    # If JSON parsing fails, try to extract JSON object from text
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        return json.loads(json_match.group())
                    return {"status": "error", "error": "Failed to parse JSON response", "raw_response": response_text}
                    
            except Exception as e:
                last_error = e
                is_quota, retry_delay = self._is_quota_error(e)
                
                if is_quota:
                    # Try fallback model first
                    if attempt == 0:
                        fallback_model = self._try_fallback_model(current_model_name)
                        if fallback_model:
                            model_instance = fallback_model
                            current_model_name = self.model_name
                            print(f"Retrying with fallback model after quota error...")
                            continue
                    
                    # If still quota error, wait and retry
                    if attempt < max_retries:
                        wait_time = retry_delay or (60 * (attempt + 1))
                        print(f"[AI Warning] Quota exceeded, retrying in {wait_time:.1f}s... (attempt {attempt + 1}/{max_retries + 1})")
                        time.sleep(min(wait_time, 120))
                        continue
                    else:
                        return {
                            "status": "error",
                            "error": (
                                f"Gemini API quota exceeded after {max_retries + 1} attempts. "
                                f"Please check your plan and billing at https://ai.google.dev/gemini-api/docs/rate-limits. "
                                f"To monitor usage: https://ai.dev/usage?tab=rate-limit"
                            ),
                            "quota_exceeded": True,
                            "details": str(e)[:200]
                        }
                else:
                    # Non-quota error
                    return {"status": "error", "error": str(e)}
        
        return {"status": "error", "error": f"Failed after {max_retries + 1} attempts: {str(last_error)}"}


# Global client instance
gemini_client = GeminiClient()

