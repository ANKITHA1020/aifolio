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
        self.model_name = None  # Short name (e.g., "gemini-2.0-flash")
        self.model_name_full = None  # Full name (e.g., "models/gemini-2.0-flash")
        self._initialized = False
        self.available_models_list = []  # Store list of available models
        # Prefer models with better free tier limits - updated to match current available models
        self.preferred_models = [
            'gemini-2.0-flash',  # Stable and fast
            'gemini-2.5-flash',  # Latest stable
            'gemini-flash-latest',  # Always latest
            'gemini-2.0-flash-exp',  # Experimental but available
            'gemini-2.5-flash-lite',  # Lightweight option
        ]
    
    def _get_available_models(self) -> Optional[Tuple[str, str]]:
        """
        List available models and return the first usable one, preferring stable models
        Returns: (model_name_short, model_name_full) tuple
        """
        try:
            models = genai.list_models()
            available_models = []  # List of (short_name, full_name) tuples
            
            # Collect all available models with their full names
            for model in models:
                if 'generateContent' in model.supported_generation_methods:
                    full_name = model.name  # e.g., "models/gemini-2.0-flash"
                    short_name = full_name.replace('models/', '')  # e.g., "gemini-2.0-flash"
                    available_models.append((short_name, full_name))
                    print(f"Available model: {full_name} (short: {short_name})")
            
            # Store available models for fallback use
            self.available_models_list = available_models
            
            if not available_models:
                print("No models with generateContent support found")
                return None
            
            # Prefer models from our preferred list (updated to match current available models)
            preferred_order = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash-exp', 'gemini-2.5-flash-lite']
            for preferred in preferred_order:
                for short_name, full_name in available_models:
                    if preferred == short_name:
                        print(f"Found preferred model: {full_name}")
                        return (short_name, full_name)
            
            # If no preferred model found, return first available (but avoid experimental)
            for short_name, full_name in available_models:
                if 'exp' not in short_name.lower() and 'experimental' not in short_name.lower() and 'preview' not in short_name.lower():
                    print(f"Found available model: {full_name}")
                    return (short_name, full_name)
            
            # Last resort: return first available
            if available_models:
                short_name, full_name = available_models[0]
                print(f"Using available model: {full_name}")
                return (short_name, full_name)
            
            return None
        except Exception as e:
            print(f"Error listing models: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _initialize(self):
        """Initialize API key from settings"""
        if not self._initialized:
            self.api_key = getattr(settings, 'GEMINI_API_KEY', '')
            if self.api_key:
                try:
                    genai.configure(api_key=self.api_key)
                    # List available models and use the first one that supports generateContent
                    model_info = self._get_available_models()
                    if model_info:
                        short_name, full_name = model_info
                        try:
                            # Use the full model name (with "models/" prefix)
                            self.model = genai.GenerativeModel(full_name)
                            self.model_name = short_name
                            self.model_name_full = full_name
                            print(f"Initialized Gemini with model: {full_name} (short: {short_name})")
                        except Exception as e:
                            print(f"Error initializing model {full_name}: {e}")
                            import traceback
                            traceback.print_exc()
                            # Try fallback models
                            self._try_fallback_initialization()
                    else:
                        # Fallback: try preferred model names
                        print("No models found from list_models(), trying fallback initialization")
                        self._try_fallback_initialization()
                except Exception as e:
                    print(f"Warning: Failed to initialize Gemini client: {e}")
                    # Try fallback initialization
                    self._try_fallback_initialization()
            self._initialized = True
    
    def _try_fallback_initialization(self):
        """Try to initialize with fallback models"""
        # First, try to use available models from the list if we have them
        if self.available_models_list:
            # Prefer stable models (non-experimental, non-preview)
            for short_name, full_name in self.available_models_list:
                if 'exp' not in short_name.lower() and 'preview' not in short_name.lower() and 'experimental' not in short_name.lower():
                    try:
                        self.model = genai.GenerativeModel(full_name)
                        self.model_name = short_name
                        self.model_name_full = full_name
                        print(f"Initialized Gemini with fallback model: {full_name} (short: {short_name})")
                        return
                    except Exception as e:
                        print(f"Failed to initialize {full_name}: {e}")
                        continue
            
            # If no stable model works, try any available model
            for short_name, full_name in self.available_models_list:
                try:
                    self.model = genai.GenerativeModel(full_name)
                    self.model_name = short_name
                    self.model_name_full = full_name
                    print(f"Initialized Gemini with fallback model: {full_name} (short: {short_name})")
                    return
                except Exception as e:
                    print(f"Failed to initialize {full_name}: {e}")
                    continue
        
        # Last resort: try preferred models (updated to match current available models)
        fallback_models = [
            'models/gemini-2.0-flash',
            'gemini-2.0-flash',
            'models/gemini-2.5-flash',
            'gemini-2.5-flash',
            'models/gemini-flash-latest',
            'gemini-flash-latest',
            'models/gemini-2.0-flash-exp',
            'gemini-2.0-flash-exp',
        ]
        for model_name in fallback_models:
            try:
                self.model = genai.GenerativeModel(model_name)
                # Store both short and full names
                if model_name.startswith('models/'):
                    self.model_name_full = model_name
                    self.model_name = model_name.replace('models/', '')
                else:
                    self.model_name = model_name
                    self.model_name_full = f'models/{model_name}'
                print(f"Initialized Gemini with fallback model: {self.model_name_full} (short: {self.model_name})")
                return
            except Exception as e:
                print(f"Failed to initialize {model_name}: {e}")
                continue
        print("Warning: Could not initialize any Gemini model")
        self.model = None
        self.model_name = None
        self.model_name_full = None
    
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
            current_model_name = self.model_name_full or self.model_name or ""
        
        # Extract short name if full name provided
        current_short = current_model_name.replace('models/', '')
        
        # First, try to use available models from the list
        if self.available_models_list:
            for short_name, full_name in self.available_models_list:
                if short_name != current_short:
                    try:
                        model = genai.GenerativeModel(full_name)
                        self.model_name = short_name
                        self.model_name_full = full_name
                        print(f"Switched to fallback model: {full_name} (short: {short_name})")
                        return model
                    except Exception as e:
                        print(f"Failed to switch to {full_name}: {e}")
                        continue
        
        # Fallback: try preferred models (with models/ prefix)
        for model_name in self.preferred_models:
            if model_name != current_short:
                # Try with models/ prefix first
                try:
                    model = genai.GenerativeModel(f'models/{model_name}')
                    self.model_name = model_name
                    self.model_name_full = f'models/{model_name}'
                    print(f"Switched to fallback model: models/{model_name}")
                    return model
                except Exception:
                    # Try without prefix
                    try:
                        model = genai.GenerativeModel(model_name)
                        self.model_name = model_name
                        self.model_name_full = f'models/{model_name}'
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
        
        # Always use the initialized model if available, or try to get a working model
        if not model or model in ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"]:
            # Use the initialized model
            if self.model:
                model_instance = self.model
                current_model_name = self.model_name_full or self.model_name
            else:
                # Try to reinitialize
                self._initialize()
                if self.model:
                    model_instance = self.model
                    current_model_name = self.model_name_full or self.model_name
                else:
                    return f"[AI Error] No Gemini model available. Please check your API key and model configuration."
        else:
            # Try to use the specified model
            try:
                # Try with models/ prefix first
                if not model.startswith('models/'):
                    try:
                        model_instance = genai.GenerativeModel(f'models/{model}')
                        current_model_name = f'models/{model}'
                    except:
                        model_instance = genai.GenerativeModel(model)
                        current_model_name = model
                else:
                    model_instance = genai.GenerativeModel(model)
                    current_model_name = model
            except Exception as e:
                print(f"Error creating model {model}: {e}")
                # Fallback to default model if specified model fails
                if self.model:
                    model_instance = self.model
                    current_model_name = self.model_name_full or self.model_name
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
                error_str = str(e)
                
                # Check for model not found or API version errors
                if '404' in error_str and ('not found' in error_str.lower() or 'not supported' in error_str.lower()):
                    # Try to reinitialize with a different model
                    print(f"Model error detected: {error_str}")
                    if attempt == 0:
                        # Try to switch to a different model
                        fallback_model = self._try_fallback_model(current_model_name)
                        if fallback_model:
                            model_instance = fallback_model
                            current_model_name = self.model_name
                            print(f"Retrying with fallback model: {current_model_name}")
                            continue
                    # If we can't switch models, return error
                    return f"[AI Error] Model '{current_model_name}' is not available or not supported. Please check your API key and model configuration. Error: {error_str[:200]}"
                
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
        
        # Always use the initialized model if available, or try to get a working model
        if not model or model in ["gemini-pro", "gemini-1.5-flash", "gemini-1.5-pro"]:
            # Use the initialized model
            if self.model:
                model_instance = self.model
                current_model_name = self.model_name_full or self.model_name
            else:
                # Try to reinitialize
                self._initialize()
                if self.model:
                    model_instance = self.model
                    current_model_name = self.model_name_full or self.model_name
                else:
                    return {"status": "error", "error": "No Gemini model available. Please check your API key and model configuration."}
        else:
            # Try to use the specified model
            try:
                # Try with models/ prefix first
                if not model.startswith('models/'):
                    try:
                        model_instance = genai.GenerativeModel(f'models/{model}')
                        current_model_name = f'models/{model}'
                    except:
                        model_instance = genai.GenerativeModel(model)
                        current_model_name = model
                else:
                    model_instance = genai.GenerativeModel(model)
                    current_model_name = model
            except Exception as e:
                print(f"Error creating model {model}: {e}")
                if self.model:
                    model_instance = self.model
                    current_model_name = self.model_name_full or self.model_name
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
                error_str = str(e)
                
                # Check for model not found or API version errors
                if '404' in error_str and ('not found' in error_str.lower() or 'not supported' in error_str.lower()):
                    # Try to reinitialize with a different model
                    print(f"Model error detected: {error_str}")
                    if attempt == 0:
                        # Try to switch to a different model
                        fallback_model = self._try_fallback_model(current_model_name)
                        if fallback_model:
                            model_instance = fallback_model
                            current_model_name = self.model_name
                            print(f"Retrying with fallback model: {current_model_name}")
                            continue
                    # If we can't switch models, return error
                    return {
                        "status": "error",
                        "error": f"Model '{current_model_name}' is not available or not supported. Please check your API key and model configuration.",
                        "details": error_str[:200]
                    }
                
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

