"""
Google Gemini client for AI services
This module provides a wrapper around Google Gemini API calls
"""
import os
from typing import Optional, Dict, Any, List, Tuple, Set
import google.generativeai as genai
from django.conf import settings
import json
import time
import re
import logging
import random


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
        # Model health tracking
        self.failed_models: Set[str] = set()  # Models that have failed in current session
        self.model_attempts: Dict[str, int] = {}  # Track attempt counts per model
        self.last_quota_error_time: Dict[str, float] = {}  # Timestamp of last quota error per model
        self.model_last_used: Dict[str, float] = {}  # Track when each model was last used (for LRU)
        # Logger
        self.logger = logging.getLogger(__name__)
    
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
                    self.logger.debug(f"Available model: {full_name} (short: {short_name})")
            
            # Store available models for fallback use
            self.available_models_list = available_models
            
            if not available_models:
                self.logger.warning("No models with generateContent support found")
                return None
            
            # Prefer models from our preferred list (updated to match current available models)
            preferred_order = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.0-flash-exp', 'gemini-2.5-flash-lite']
            for preferred in preferred_order:
                for short_name, full_name in available_models:
                    if preferred == short_name:
                        self.logger.info(f"Found preferred model: {full_name}")
                        return (short_name, full_name)
            
            # If no preferred model found, return first available (but avoid experimental)
            for short_name, full_name in available_models:
                if 'exp' not in short_name.lower() and 'experimental' not in short_name.lower() and 'preview' not in short_name.lower():
                    self.logger.info(f"Found available model: {full_name}")
                    return (short_name, full_name)
            
            # Last resort: return first available
            if available_models:
                short_name, full_name = available_models[0]
                self.logger.info(f"Using available model: {full_name}")
                return (short_name, full_name)
            
            return None
        except Exception as e:
            self.logger.error(f"Error listing models: {e}", exc_info=True)
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
                            self.logger.info(f"Initialized Gemini with model: {full_name} (short: {short_name})")
                        except Exception as e:
                            self.logger.error(f"Error initializing model {full_name}: {e}", exc_info=True)
                            # Try fallback models
                            self._try_fallback_initialization()
                    else:
                        # Fallback: try preferred model names
                        self.logger.warning("No models found from list_models(), trying fallback initialization")
                        self._try_fallback_initialization()
                except Exception as e:
                    self.logger.warning(f"Failed to initialize Gemini client: {e}", exc_info=True)
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
                        self.logger.info(f"Initialized Gemini with fallback model: {full_name} (short: {short_name})")
                        return
                    except Exception as e:
                        self.logger.debug(f"Failed to initialize {full_name}: {e}")
                        continue
            
            # If no stable model works, try any available model
            for short_name, full_name in self.available_models_list:
                try:
                    self.model = genai.GenerativeModel(full_name)
                    self.model_name = short_name
                    self.model_name_full = full_name
                    self.logger.info(f"Initialized Gemini with fallback model: {full_name} (short: {short_name})")
                    return
                except Exception as e:
                    self.logger.debug(f"Failed to initialize {full_name}: {e}")
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
                self.logger.info(f"Initialized Gemini with fallback model: {self.model_name_full} (short: {self.model_name})")
                return
            except Exception as e:
                self.logger.debug(f"Failed to initialize {model_name}: {e}")
                continue
        self.logger.warning("Could not initialize any Gemini model")
        self.model = None
        self.model_name = None
        self.model_name_full = None
    
    def _reset_model_health(self):
        """Reset model health tracking after successful request"""
        self.failed_models.clear()
        self.model_attempts.clear()
        # Keep last_quota_error_time for tracking, but clear old entries (> 5 minutes)
        current_time = time.time()
        self.last_quota_error_time = {
            k: v for k, v in self.last_quota_error_time.items()
            if current_time - v < 300  # Keep entries from last 5 minutes
        }
    
    def _mark_model_failed(self, model_name: str, is_quota_error: bool = False):
        """Track model failure"""
        short_name = model_name.replace('models/', '')
        self.failed_models.add(short_name)
        self.model_attempts[short_name] = self.model_attempts.get(short_name, 0) + 1
        if is_quota_error:
            self.last_quota_error_time[short_name] = time.time()
        self.logger.warning(f"Model {short_name} marked as failed (attempt {self.model_attempts[short_name]})")
    
    def is_configured(self) -> bool:
        """Check if Gemini is configured"""
        self._initialize()
        return self.api_key is not None and len(self.api_key) > 0 and self.model is not None
    
    def _is_quota_error(self, error: Exception) -> Tuple[bool, Optional[float], str]:
        """
        Check if error is a quota/rate limit error and extract retry delay
        
        Returns:
            (is_quota_error, retry_delay_seconds, error_type)
            error_type: 'rate_limit' or 'quota_exhausted'
        """
        error_str = str(error)
        error_lower = error_str.lower()
        
        # Enhanced quota/rate limit indicators
        quota_indicators = [
            '429',
            'quota',
            'rate limit',
            'rate_limit',
            'exceeded',
            'RESOURCE_EXHAUSTED',
            'resource_exhausted',
            'too many requests',
            'quota exceeded',
            'billing',
            'permission denied',
            'PERMISSION_DENIED',
        ]
        
        is_quota = any(indicator.lower() in error_lower for indicator in quota_indicators)
        
        if not is_quota:
            return False, None, ''
        
        # Determine error type
        error_type = 'quota_exhausted'
        if 'rate' in error_lower or '429' in error_str:
            error_type = 'rate_limit'
        
        # Try to extract retry delay from error message
        retry_delay = None
        
        # Enhanced patterns for extracting retry delay
        delay_patterns = [
            r'retry.*?(\d+\.?\d*)\s*seconds?',
            r'retry_delay.*?(\d+\.?\d*)',
            r'Please retry in (\d+\.?\d*)s',
            r'retry.*?after.*?(\d+\.?\d*)',
            r'wait.*?(\d+\.?\d*).*?seconds?',
            r'backoff.*?(\d+\.?\d*)',
            r'Retry-After[:\s]+(\d+)',
        ]
        
        for pattern in delay_patterns:
            match = re.search(pattern, error_str, re.IGNORECASE)
            if match:
                try:
                    retry_delay = float(match.group(1))
                    break
                except (ValueError, IndexError):
                    continue
        
        # Check for HTTP Retry-After header if available
        if hasattr(error, 'response') and hasattr(error.response, 'headers'):
            retry_after = error.response.headers.get('Retry-After')
            if retry_after:
                try:
                    retry_delay = float(retry_after)
                except (ValueError, TypeError):
                    pass
        
        # Default retry delay if not found (shorter for rate limits, longer for quota)
        if retry_delay is None:
            retry_delay = 30.0 if error_type == 'rate_limit' else 60.0
        
        return True, retry_delay, error_type
    
    def _get_next_available_model(self, exclude_models: Optional[Set[str]] = None) -> Optional[Tuple[str, str]]:
        """
        Get next available model using rotation strategy (LRU with health tracking)
        
        Args:
            exclude_models: Set of model short names to exclude
            
        Returns:
            (short_name, full_name) tuple or None
        """
        if exclude_models is None:
            exclude_models = set()
        
        current_time = time.time()
        QUOTA_COOLDOWN = 300  # 5 minutes
        
        # Filter out models that failed recently due to quota
        available_candidates = []
        
        # First, try available models from list
        if self.available_models_list:
            for short_name, full_name in self.available_models_list:
                if short_name in exclude_models:
                    continue
                # Skip if model failed recently due to quota
                if short_name in self.last_quota_error_time:
                    if current_time - self.last_quota_error_time[short_name] < QUOTA_COOLDOWN:
                        continue
                available_candidates.append((short_name, full_name))
        
        # If no available models, try preferred models
        if not available_candidates:
            for model_name in self.preferred_models:
                if model_name in exclude_models:
                    continue
                if model_name in self.last_quota_error_time:
                    if current_time - self.last_quota_error_time[model_name] < QUOTA_COOLDOWN:
                        continue
                # Try both with and without models/ prefix
                available_candidates.append((model_name, f'models/{model_name}'))
        
        if not available_candidates:
            return None
        
        # Sort by last used time (LRU) - prefer models not recently used
        available_candidates.sort(
            key=lambda x: self.model_last_used.get(x[0], 0)
        )
        
        return available_candidates[0]
    
    def _try_fallback_model(self, current_model_name: str, tried_models: Optional[Set[str]] = None) -> Optional[genai.GenerativeModel]:
        """
        Try to get a fallback model if current one has quota issues
        
        Args:
            current_model_name: Current model name (full or short)
            tried_models: Set of model short names already tried in this request
            
        Returns:
            GenerativeModel instance or None
        """
        if tried_models is None:
            tried_models = set()
        
        if not current_model_name:
            current_model_name = self.model_name_full or self.model_name or ""
        
        # Extract short name if full name provided
        current_short = current_model_name.replace('models/', '')
        tried_models.add(current_short)
        
        # Try multiple fallback models
        max_fallback_attempts = 3
        for attempt in range(max_fallback_attempts):
            model_info = self._get_next_available_model(exclude_models=tried_models)
            if not model_info:
                break
            
            short_name, full_name = model_info
            tried_models.add(short_name)
            
            # Try with the full name first
            try:
                model = genai.GenerativeModel(full_name)
                self.model_name = short_name
                self.model_name_full = full_name
                self.model_last_used[short_name] = time.time()
                self.logger.info(f"Switched to fallback model: {full_name} (short: {short_name})")
                return model
            except Exception as e:
                self.logger.debug(f"Failed to switch to {full_name}: {e}")
                # If full_name has models/ prefix, try without it
                if full_name.startswith('models/'):
                    try:
                        model = genai.GenerativeModel(short_name)
                        self.model_name = short_name
                        self.model_name_full = full_name
                        self.model_last_used[short_name] = time.time()
                        self.logger.info(f"Switched to fallback model: {short_name}")
                        return model
                    except Exception:
                        continue
                continue
        
        self.logger.warning(f"Could not find available fallback model after {max_fallback_attempts} attempts")
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
                self.logger.error(f"Error creating model {model}: {e}")
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
        
        # Track models tried in this request
        tried_models: Set[str] = set()
        current_short = current_model_name.replace('models/', '') if current_model_name else ''
        if current_short:
            tried_models.add(current_short)
        
        # Retry logic for quota errors
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                response = model_instance.generate_content(
                    prompt,
                    generation_config=generation_config
                )
                # Success - reset health tracking
                self._reset_model_health()
                return response.text
                
            except Exception as e:
                last_error = e
                error_str = str(e)
                
                # Check for model not found or API version errors
                if '404' in error_str and ('not found' in error_str.lower() or 'not supported' in error_str.lower()):
                    # Try to reinitialize with a different model
                    self.logger.warning(f"Model error detected: {error_str}")
                    self._mark_model_failed(current_model_name, is_quota_error=False)
                    
                    # Try to switch to a different model (can try on any attempt)
                    fallback_model = self._try_fallback_model(current_model_name, tried_models)
                    if fallback_model:
                        model_instance = fallback_model
                        current_model_name = self.model_name_full or self.model_name
                        current_short = self.model_name
                        tried_models.add(current_short)
                        self.logger.info(f"Retrying with fallback model: {current_model_name}")
                        continue
                    # If we can't switch models, return error
                    return f"[AI Error] Model '{current_model_name}' is not available or not supported. Please check your API key and model configuration. Error: {error_str[:200]}"
                
                is_quota, retry_delay, error_type = self._is_quota_error(e)
                
                if is_quota:
                    self._mark_model_failed(current_model_name, is_quota_error=True)
                    self.logger.warning(
                        f"Quota error ({error_type}) on model {current_short}: {error_str[:200]}"
                    )
                    
                    # Try fallback model (can try multiple times)
                    fallback_model = self._try_fallback_model(current_model_name, tried_models)
                    if fallback_model:
                        model_instance = fallback_model
                        current_model_name = self.model_name_full or self.model_name
                        current_short = self.model_name
                        tried_models.add(current_short)
                        self.logger.info(f"Retrying with fallback model after quota error: {current_model_name}")
                        continue
                    
                    # If still quota error and no fallback available, wait and retry
                    if attempt < max_retries:
                        # Exponential backoff with jitter
                        base_wait = retry_delay or (60 * (attempt + 1))
                        jitter = random.uniform(0, base_wait * 0.1)  # 10% jitter
                        wait_time = min(base_wait + jitter, 120)  # Cap at 2 minutes
                        
                        error_msg = (
                            f"Gemini API quota exceeded ({error_type}). "
                            f"Please check your plan and billing at https://ai.google.dev/gemini-api/docs/rate-limits. "
                            f"Retrying in {wait_time:.1f} seconds... (attempt {attempt + 1}/{max_retries + 1})"
                        )
                        self.logger.warning(error_msg)
                        time.sleep(wait_time)
                        continue
                    else:
                        # Max retries reached
                        error_msg = (
                            f"[AI Error] Gemini API quota exceeded after {max_retries + 1} attempts. "
                            f"Please check your plan and billing details at https://ai.google.dev/gemini-api/docs/rate-limits. "
                            f"To monitor usage: https://ai.dev/usage?tab=rate-limit. "
                            f"Error: {str(e)[:200]}"
                        )
                        self.logger.error(error_msg)
                        return error_msg
                else:
                    # Non-quota error, mark as failed and return
                    self._mark_model_failed(current_model_name, is_quota_error=False)
                    self.logger.error(f"Non-quota error on model {current_short}: {error_str[:200]}")
                    return f"[AI Error] {str(e)}"
        
        # Should not reach here, but handle it
        error_msg = f"[AI Error] Failed after {max_retries + 1} attempts: {str(last_error)}"
        self.logger.error(error_msg)
        return error_msg
    
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
                self.logger.error(f"Error creating model {model}: {e}")
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
        
        # Track models tried in this request
        tried_models: Set[str] = set()
        current_short = current_model_name.replace('models/', '') if current_model_name else ''
        if current_short:
            tried_models.add(current_short)
        
        # Retry logic for quota errors
        last_error = None
        for attempt in range(max_retries + 1):
            try:
                response = model_instance.generate_content(
                    json_prompt,
                    generation_config=generation_config
                )
                
                # Success - reset health tracking
                self._reset_model_health()
                
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
                    self.logger.warning(f"Model error detected: {error_str}")
                    self._mark_model_failed(current_model_name, is_quota_error=False)
                    
                    # Try to switch to a different model (can try on any attempt)
                    fallback_model = self._try_fallback_model(current_model_name, tried_models)
                    if fallback_model:
                        model_instance = fallback_model
                        current_model_name = self.model_name_full or self.model_name
                        current_short = self.model_name
                        tried_models.add(current_short)
                        self.logger.info(f"Retrying with fallback model: {current_model_name}")
                        continue
                    # If we can't switch models, return error
                    return {
                        "status": "error",
                        "error": f"Model '{current_model_name}' is not available or not supported. Please check your API key and model configuration.",
                        "details": error_str[:200]
                    }
                
                is_quota, retry_delay, error_type = self._is_quota_error(e)
                
                if is_quota:
                    self._mark_model_failed(current_model_name, is_quota_error=True)
                    self.logger.warning(
                        f"Quota error ({error_type}) on model {current_short}: {error_str[:200]}"
                    )
                    
                    # Try fallback model (can try multiple times)
                    fallback_model = self._try_fallback_model(current_model_name, tried_models)
                    if fallback_model:
                        model_instance = fallback_model
                        current_model_name = self.model_name_full or self.model_name
                        current_short = self.model_name
                        tried_models.add(current_short)
                        self.logger.info(f"Retrying with fallback model after quota error: {current_model_name}")
                        continue
                    
                    # If still quota error and no fallback available, wait and retry
                    if attempt < max_retries:
                        # Exponential backoff with jitter
                        base_wait = retry_delay or (60 * (attempt + 1))
                        jitter = random.uniform(0, base_wait * 0.1)  # 10% jitter
                        wait_time = min(base_wait + jitter, 120)  # Cap at 2 minutes
                        
                        self.logger.warning(
                            f"Quota exceeded ({error_type}), retrying in {wait_time:.1f}s... "
                            f"(attempt {attempt + 1}/{max_retries + 1})"
                        )
                        time.sleep(wait_time)
                        continue
                    else:
                        error_response = {
                            "status": "error",
                            "error": (
                                f"Gemini API quota exceeded after {max_retries + 1} attempts. "
                                f"Please check your plan and billing at https://ai.google.dev/gemini-api/docs/rate-limits. "
                                f"To monitor usage: https://ai.dev/usage?tab=rate-limit"
                            ),
                            "quota_exceeded": True,
                            "details": str(e)[:200]
                        }
                        self.logger.error(f"Quota exceeded after all retries: {error_str[:200]}")
                        return error_response
                else:
                    # Non-quota error
                    self._mark_model_failed(current_model_name, is_quota_error=False)
                    self.logger.error(f"Non-quota error on model {current_short}: {error_str[:200]}")
                    return {"status": "error", "error": str(e)}
        
        error_response = {"status": "error", "error": f"Failed after {max_retries + 1} attempts: {str(last_error)}"}
        self.logger.error(error_response["error"])
        return error_response


# Global client instance
gemini_client = GeminiClient()

