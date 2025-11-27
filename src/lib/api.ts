/**
 * API Client for Django Backend
 * Handles all API requests with JWT authentication
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Get authentication token from localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Set authentication tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Clear authentication tokens
   */
  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, refreshToken);
        return data.access;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }

    return null;
  }

  /**
   * Make API request with automatic token refresh
   */
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, ...fetchOptions } = options;

    // Build headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if required
    if (requiresAuth) {
      let token = this.getToken();
      if (!token) {
        // Try to refresh token
        token = await this.refreshAccessToken();
      }
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Build full URL
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: requestHeaders,
      });

      // Handle token refresh on 401
      if (response.status === 401 && requiresAuth) {
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          // Retry request with new token
          requestHeaders['Authorization'] = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            ...fetchOptions,
            headers: requestHeaders,
          });
          if (!retryResponse.ok) {
            throw new Error(`API request failed: ${retryResponse.statusText}`);
          }
          return retryResponse.json();
        } else {
          // Refresh failed, clear tokens
          this.clearTokens();
          // Don't redirect here - let the component handle it
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Create a custom error that preserves the full error response
        const errorMessage = errorData.error || errorData.detail || response.statusText;
        const apiError = new Error(errorMessage) as any;
        
        // Attach the full error response data to the error object
        apiError.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
        
        // Preserve all error response fields (error_type, instructions, job_id, status, etc.)
        if (errorData.error_type) {
          apiError.error_type = errorData.error_type;
        }
        if (errorData.instructions) {
          apiError.instructions = errorData.instructions;
        }
        if (errorData.job_id) {
          apiError.job_id = errorData.job_id;
        }
        if (errorData.status) {
          apiError.status = errorData.status;
        }
        
        // Handle Django REST Framework validation errors
        // DRF returns errors as: {field_name: [error messages]} or {field_name: "error message"}
        // or {non_field_errors: [error messages]} for general errors
        const errorMessages: string[] = [];
        
        // Check if this looks like a DRF validation error (has field names as keys)
        const isDRFValidationError = Object.keys(errorData).some(key => 
          key !== 'error' && key !== 'detail' && key !== 'error_type' && key !== 'instructions' && 
          key !== 'job_id' && key !== 'status' &&
          (Array.isArray(errorData[key]) || typeof errorData[key] === 'string')
        );
        
        if (isDRFValidationError) {
          // Handle field-specific errors
          Object.keys(errorData).forEach(field => {
            if (field === 'non_field_errors') {
              const nonFieldErrors = Array.isArray(errorData[field]) ? errorData[field] : [errorData[field]];
              errorMessages.push(nonFieldErrors[0]);
            } else if (field !== 'error' && field !== 'detail' && 
                       field !== 'error_type' && field !== 'instructions' && 
                       field !== 'job_id' && field !== 'status') {
              const fieldErrors = Array.isArray(errorData[field]) ? errorData[field] : [errorData[field]];
              const fieldLabel = field.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ');
              errorMessages.push(`${fieldLabel}: ${fieldErrors[0]}`);
            }
          });
          
          // If we have field errors, update the error message but keep the response data
          if (errorMessages.length > 0) {
            apiError.message = errorMessages.join('. ');
          }
        }
        
        throw apiError;
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      return {} as T;
    } catch (error) {
      // Handle network errors (CORS, connection refused, etc.)
      if (error instanceof TypeError) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('fetch') || errorMsg.includes('network') || errorMsg.includes('failed')) {
          throw new Error(
            'Failed to connect to the server. Please ensure the backend server is running at http://localhost:8000'
          );
        }
      }
      // Handle CORS errors
      if (error instanceof Error && error.message.includes('CORS')) {
        throw new Error(
          'CORS error: The backend server may not be configured to allow requests from this origin. Please check CORS settings.'
        );
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unknown error occurred');
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T>(
    endpoint: string,
    formData: FormData,
    options?: RequestOptions & { method?: string }
  ): Promise<T> {
    const { requiresAuth = true, headers = {}, method = 'POST', ...fetchOptions } = options || {};

    const requestHeaders: HeadersInit = {
      ...headers,
      // Don't set Content-Type for FormData, browser will set it with boundary
    };

    if (requiresAuth) {
      let token = this.getToken();
      if (!token) {
        token = await this.refreshAccessToken();
      }
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const response = await fetch(url, {
      ...fetchOptions,
      method: method,
      headers: requestHeaders,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.detail || response.statusText);
    }

    return response.json();
  }
}

// Authentication API methods
export const authApi = {
  register: async (data: {
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
  }) => {
    return api.post('/auth/register/', data, { requiresAuth: false });
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post<{
      user: any;
      tokens: { access: string; refresh: string };
      message: string;
    }>('/auth/login/', data, { requiresAuth: false });
    
    if (response.tokens) {
      api.setTokens(response.tokens.access, response.tokens.refresh);
    }
    
    return response;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/auth/logout/', { refresh: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    api.clearTokens();
  },

  getCurrentUser: async () => {
    const response = await api.get<{ user?: any } | any>('/auth/me/');
    // Handle both response formats: {user: ...} or direct user object
    return response.user ? response : { user: response };
  },

  getProfile: async () => {
    return api.get('/users/profile/');
  },

  updateProfile: async (data: Partial<{
    bio: string;
    photo: File;
    theme_preference: string;
    first_name: string;
    last_name: string;
  }>) => {
    if (data.photo) {
      // Handle file upload separately
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'photo' && data.photo) {
          formData.append('photo', data.photo);
        } else if (data[key as keyof typeof data]) {
          formData.append(key, String(data[key as keyof typeof data]));
        }
      });
      return api.upload('/users/profile/', formData);
    }
    return api.patch('/users/profile/', data);
  },

  getOAuthUrl: async (provider: 'google' | 'github', redirectUri: string) => {
    const response = await api.get<{ auth_url: string }>(
      `/auth/oauth/redirect/?provider=${provider}&redirect_uri=${encodeURIComponent(redirectUri)}`,
      { requiresAuth: false }
    );
    return response.auth_url;
  },

  oauthCallback: async (provider: string, accessToken: string) => {
    return api.post<{
      user: any;
      tokens: { access: string; refresh: string };
    }>('/auth/oauth/callback/', {
      provider,
      access_token: accessToken,
    }, { requiresAuth: false });
  },
};

// Resume API methods
export const resumeApi = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.upload<{
      id: number;
      file: string;
      uploaded_at: string;
      status: string;
    }>('/resumes/uploads/', formData);
  },

  getResumes: async () => {
    const response = await api.get<Array<{
      id: number;
      file: string;
      uploaded_at: string;
      status: string;
      extracted_data?: any;
    }> | {
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{
        id: number;
        file: string;
        uploaded_at: string;
        status: string;
        extracted_data?: any;
      }>;
    }>('/resumes/uploads/');
    // Handle paginated response from DRF
    return Array.isArray(response) ? response : (response.results || []);
  },

  getResume: async (id: number) => {
    return api.get<{
      id: number;
      file: string;
      uploaded_at: string;
      status: string;
      extracted_data?: any;
    }>(`/resumes/uploads/${id}/`);
  },

  parseResume: async (resumeId: number) => {
    return api.post<{
      resume_id: number;
      structured_data: any;
      skills: Array<{
        name: string;
        category: string;
        confidence: number;
      }>;
    }>('/ai/parse-resume/', { resume_id: resumeId });
  },

  deleteResume: async (id: number) => {
    return api.delete(`/resumes/uploads/${id}/`);
  },

  reparseResume: async (id: number) => {
    return api.post<{
      resume_id: number;
      structured_data: any;
      skills: Array<{
        name: string;
        category: string;
        confidence: number;
      }>;
    }>(`/resumes/uploads/${id}/reparse/`);
  },
};

// AI API methods
export const aiApi = {
  generateBio: async (resumeData: Record<string, any>) => {
    return api.post<{ bio: string }>('/ai/generate-bio/', {
      resume_data: resumeData,
    });
  },

  generateProjectDescription: async (data: {
    title: string;
    technologies?: string[];
    skills?: string[];
  }) => {
    return api.post<{ description: string }>('/ai/generate-project-desc/', data);
  },

  improveText: async (data: {
    text: string;
    tone?: string;
    purpose?: string;
    improve_grammar?: boolean;
    improve_seo?: boolean;
  }) => {
    return api.post<{ improved_text: string }>('/ai/improve-text/', data);
  },

  extractSkills: async (resumeText: string) => {
    return api.post<{
      skills: Array<{
        name: string;
        category: string;
        confidence: number;
      }>;
    }>('/ai/extract-skills/', { resume_text: resumeText });
  },
};

// Portfolio API methods
export const portfolioApi = {
  getPortfolios: async () => {
    return api.get<Array<{
      id: number;
      title: string;
      slug: string;
      template_type: string;
      is_published: boolean;
      created_at: string;
      updated_at: string;
    }>>('/portfolios/portfolios/');
  },

  getPortfolio: async (id: number) => {
    return api.get<{
      id: number;
      title: string;
      slug: string;
      template: number | null;
      template_type: string;
      is_published: boolean;
      custom_settings: Record<string, any>;
      components: Array<{
        id: number;
        component_type: string;
        order: number;
        is_visible: boolean;
        content: Record<string, any>;
      }>;
      profile_photo_url?: string | null;
      user_profile_photo_url?: string | null;
      created_at: string;
      updated_at: string;
    }>(`/portfolios/portfolios/${id}/`);
  },

  createPortfolio: async (data: {
    title: string;
    template?: number;
    template_type?: string;
    custom_settings?: Record<string, any>;
  }) => {
    return api.post<{
      id: number;
      title: string;
      slug: string;
    }>('/portfolios/portfolios/', data);
  },

  updatePortfolio: async (id: number, data: Partial<{
    title: string;
    template?: number;
    template_type?: string;
    custom_settings?: Record<string, any>;
    is_published?: boolean;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    meta_keywords?: string;
    meta_description?: string;
    pages?: any[];
    navigation_enabled?: boolean;
    interactive_elements?: Record<string, any>;
  }>) => {
    // Filter out read-only fields and invalid data
    const validData: any = {};
    const allowedFields = [
      'title', 'template', 'template_type', 'custom_settings', 'is_published',
      'seo_title', 'seo_description', 'seo_keywords',
      'meta_keywords', 'meta_description', 'pages',
      'navigation_enabled', 'interactive_elements'
    ];
    
    // Only include allowed fields that exist in data
    allowedFields.forEach(field => {
      if (data && field in data && data[field as keyof typeof data] !== undefined) {
        validData[field] = data[field as keyof typeof data];
      }
    });
    
    return api.patch(`/portfolios/portfolios/${id}/`, validData);
  },

  deletePortfolio: async (id: number) => {
    return api.delete(`/portfolios/portfolios/${id}/`);
  },

  previewPortfolio: async (id: number) => {
    return api.get<{
      id: number;
      title: string;
      slug: string;
      template: any;
      template_type: string;
      components: Array<any>;
      custom_settings: Record<string, any>;
      profile_photo_url?: string | null;
      user_profile_photo_url?: string | null;
    }>(`/portfolios/portfolios/${id}/preview/`);
  },

  publishPortfolio: async (id: number, isPublished: boolean = true) => {
    return api.post(`/portfolios/portfolios/${id}/publish/`, {
      is_published: isPublished,
    });
  },

  getPortfolioComponents: async (portfolioId: number) => {
    return api.get<Array<{
      id: number;
      component_type: string;
      order: number;
      is_visible: boolean;
      content: Record<string, any>;
    }>>(`/portfolios/portfolios/${portfolioId}/components/`);
  },

  createComponent: async (portfolioId: number, data: {
    component_type: string;
    order: number;
    is_visible: boolean;
    content: Record<string, any>;
  }) => {
    return api.post(`/portfolios/portfolios/${portfolioId}/components/`, data);
  },

  updateComponent: async (portfolioId: number, componentId: number, data: Partial<{
    component_type: string;
    order: number;
    is_visible: boolean;
    content: Record<string, any>;
  }>) => {
    return api.patch(`/portfolios/portfolios/${portfolioId}/components/${componentId}/`, data);
  },

  deleteComponent: async (portfolioId: number, componentId: number) => {
    return api.delete(`/portfolios/portfolios/${portfolioId}/components/${componentId}/`);
  },

  uploadProfilePhoto: async (portfolioId: number, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    return api.upload(`/portfolios/portfolios/${portfolioId}/upload_photo/`, formData);
  },

  generateContent: async (portfolioId: number, componentType: string, context?: Record<string, any>, componentId?: number) => {
    return api.post<{
      component_type: string;
      content: Record<string, any>;
      success: boolean;
    }>(`/portfolios/portfolios/${portfolioId}/generate_content/`, {
      component_type: componentType,
      context: context || {},
      component_id: componentId,
    });
  },

  getResumeData: async (resumeId?: number) => {
    const url = resumeId 
      ? `/portfolios/portfolios/resume_data/?resume_id=${resumeId}`
      : '/portfolios/portfolios/resume_data/';
    return api.get<{
      has_resume: boolean;
      structured_data: Record<string, any>;
      resume_id?: number;
      filename?: string;
      uploaded_at?: string;
      message?: string;
    }>(url);
  },

  optimizeSEO: async (portfolioId: number) => {
    return api.post<{
      analysis: any;
      optimized: Record<string, any>;
      recommendations: Array<{
        type: string;
        message: string;
        priority: string;
      }>;
    }>(`/portfolios/portfolios/${portfolioId}/optimize_seo/`);
  },

  getSuggestions: async (portfolioId: number) => {
    return api.get<{
      suggestions: Array<{
        type: string;
        component?: string;
        priority: string;
        message: string;
        action: string;
      }>;
      keywords: string[];
      meta_description: string | null;
    }>(`/portfolios/portfolios/${portfolioId}/suggestions/`);
  },

  generateKeywords: async (portfolioId: number) => {
    return api.post<{
      keywords: string[];
      keywords_string: string;
    }>(`/portfolios/portfolios/${portfolioId}/generate_keywords/`);
  },

  getPublicPortfolio: async (slug: string) => {
    return api.get<{
      id: number;
      title: string;
      slug: string;
      template: number | null;
      template_type: string;
      is_published: boolean;
      custom_settings: Record<string, any>;
      components: Array<{
        id: number;
        component_type: string;
        order: number;
        is_visible: boolean;
        content: Record<string, any>;
      }>;
      profile_photo_url?: string | null;
      user_profile_photo_url?: string | null;
      seo_title?: string;
      seo_description?: string;
      seo_keywords?: string;
      meta_keywords?: string;
      meta_description?: string;
      created_at: string;
      updated_at: string;
    }>(`/portfolios/portfolios/public/${slug}/`, { requiresAuth: false });
  },
};

// Template API methods
export const templateApi = {
  getTemplates: async () => {
    const response = await api.get<Array<{
      id: number;
      name: string;
      type: string;
      description: string;
      preview_image: string | null;
      config: Record<string, any>;
      is_active: boolean;
    }> | {
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{
        id: number;
        name: string;
        type: string;
        description: string;
        preview_image: string | null;
        config: Record<string, any>;
        is_active: boolean;
      }>;
    }>('/portfolios/templates/');
    // Handle paginated response from DRF
    return Array.isArray(response) ? response : (response.results || []);
  },

  getTemplate: async (id: number) => {
    return api.get<{
      id: number;
      name: string;
      type: string;
      description: string;
      preview_image: string | null;
      config: Record<string, any>;
      is_active: boolean;
    }>(`/portfolios/templates/${id}/`);
  },
};

// Projects API methods
export const projectApi = {
  getProjects: async () => {
    const response = await api.get<Array<{
      id: number;
      title: string;
      slug: string;
      description: string;
      short_description: string;
      image: string | null;
      category: { id: number; name: string } | null;
      tags: Array<{ id: number; name: string }>;
      github_url: string | null;
      live_url: string | null;
      featured: boolean;
      order: number;
      created_at: string;
      updated_at: string;
    }> | {
      count: number;
      next: string | null;
      previous: string | null;
      results: Array<{
        id: number;
        title: string;
        slug: string;
        description: string;
        short_description: string;
        image: string | null;
        category: { id: number; name: string } | null;
        tags: Array<{ id: number; name: string }>;
        github_url: string | null;
        live_url: string | null;
        featured: boolean;
        order: number;
        created_at: string;
        updated_at: string;
      }>;
    }>('/projects/projects/');
    // Handle paginated response from DRF
    return Array.isArray(response) ? response : (response.results || []);
  },

  getProject: async (id: number) => {
    return api.get<{
      id: number;
      title: string;
      slug: string;
      description: string;
      short_description: string;
      image: string | null;
      category: { id: number; name: string } | null;
      tags: Array<{ id: number; name: string }>;
      github_url: string | null;
      live_url: string | null;
      featured: boolean;
      order: number;
      created_at: string;
      updated_at: string;
    }>(`/projects/projects/${id}/`);
  },

  createProject: async (data: {
    title: string;
    description: string;
    short_description?: string;
    image?: File;
    category?: number;
    tag_names?: string[];
    github_url?: string;
    live_url?: string;
    featured?: boolean;
    order?: number;
  }) => {
    if (data.image) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'image' && data.image) {
          formData.append('image', data.image);
        } else if (key === 'tag_names' && data.tag_names) {
          data.tag_names.forEach((tag) => formData.append('tag_names', tag));
        } else if (data[key as keyof typeof data]) {
          formData.append(key, String(data[key as keyof typeof data]));
        }
      });
      return api.upload('/projects/projects/', formData);
    }
    return api.post('/projects/projects/', data);
  },

  updateProject: async (id: number, data: Partial<{
    title: string;
    description: string;
    short_description: string;
    image: File;
    category: number;
    tag_names: string[];
    github_url: string;
    live_url: string;
    featured: boolean;
    order: number;
  }>) => {
    if (data.image) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'image' && data.image) {
          formData.append('image', data.image);
        } else if (key === 'tag_names' && data.tag_names) {
          data.tag_names.forEach((tag) => formData.append('tag_names', tag));
        } else if (data[key as keyof typeof data]) {
          formData.append(key, String(data[key as keyof typeof data]));
        }
      });
      return api.upload(`/projects/projects/${id}/`, formData, { method: 'PATCH' });
    }
    return api.patch(`/projects/projects/${id}/`, data);
  },

  deleteProject: async (id: number) => {
    return api.delete(`/projects/projects/${id}/`);
  },

  getProjectCategories: async () => {
    return api.get<Array<{ id: number; name: string; description: string }>>('/projects/categories/');
  },

  getProjectTags: async () => {
    return api.get<Array<{ id: number; name: string }>>('/projects/tags/');
  },

  generateProjectDescription: async (data: {
    title: string;
    technologies?: string[];
    skills?: string[];
  }) => {
    return api.post<{
      description: string;
      short_description: string;
    }>('/projects/projects/generate_description/', data);
  },
};

// Blog API methods
type BlogPost = {
  id: number;
  title: string;
  slug: string;
  content_markdown: string;
  excerpt: string;
  featured_image: string | null;
  category: { id: number; name: string } | null;
  tags: Array<{ id: number; name: string }>;
  published: boolean;
  published_date: string | null;
  views: number;
  created_at: string;
  updated_at: string;
};

type BlogPostListResponse = Array<BlogPost> | {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<BlogPost>;
};

export const blogApi = {
  getBlogPosts: async () => {
    const response = await api.get<BlogPostListResponse>('/blogs/posts/');
    return Array.isArray(response) ? response : (response.results || []);
  },

  getBlogPost: async (id: number) => {
    return api.get<BlogPost>(`/blogs/posts/${id}/`);
  },

  createBlogPost: async (data: {
    title: string;
    content_markdown: string;
    excerpt?: string;
    featured_image?: File;
    category?: number;
    tag_names?: string[];
    published?: boolean;
  }) => {
    if (data.featured_image) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'featured_image' && data.featured_image) {
          formData.append('featured_image', data.featured_image);
        } else if (key === 'tag_names' && data.tag_names) {
          data.tag_names.forEach((tag) => formData.append('tag_names', tag));
        } else if (data[key as keyof typeof data]) {
          formData.append(key, String(data[key as keyof typeof data]));
        }
      });
      return api.upload('/blogs/posts/', formData);
    }
    return api.post('/blogs/posts/', data);
  },

  updateBlogPost: async (id: number, data: Partial<{
    title: string;
    content_markdown: string;
    excerpt: string;
    featured_image: File;
    category: number;
    tag_names: string[];
    published: boolean;
  }>) => {
    if (data.featured_image) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'featured_image' && data.featured_image) {
          formData.append('featured_image', data.featured_image);
        } else if (key === 'tag_names' && data.tag_names) {
          data.tag_names.forEach((tag) => formData.append('tag_names', tag));
        } else if (data[key as keyof typeof data]) {
          formData.append(key, String(data[key as keyof typeof data]));
        }
      });
      return api.upload(`/blogs/posts/${id}/`, formData, { method: 'PATCH' });
    }
    return api.patch(`/blogs/posts/${id}/`, data);
  },

  deleteBlogPost: async (id: number) => {
    return api.delete(`/blogs/posts/${id}/`);
  },

  getBlogCategories: async () => {
    return api.get<Array<{ id: number; name: string; description: string }>>('/blogs/categories/');
  },

  getBlogTags: async () => {
    return api.get<Array<{ id: number; name: string }>>('/blogs/tags/');
  },

  generateBlogOutline: async (topic: string) => {
    return api.post<{
      title: string;
      sections: Array<{
        heading: string;
        content: string;
      }>;
    }>('/blogs/posts/generate_outline/', { topic });
  },

  generateBlogContent: async (data: {
    topic?: string;
    title?: string;
    outline?: any;
  }) => {
    return api.post<{
      content: string;
    }>('/blogs/posts/generate_content/', data);
  },

  improveBlogContent: async (postId: number, data: {
    improve_grammar?: boolean;
    improve_seo?: boolean;
    tone?: string;
  }) => {
    return api.post<{
      improved_content: string;
    }>(`/blogs/posts/${postId}/improve_content/`, data);
  },

  generateBlogExcerpt: async (postId: number, maxLength?: number) => {
    return api.post<{
      excerpt: string;
    }>(`/blogs/posts/${postId}/generate_excerpt/`, { max_length: maxLength || 300 });
  },
};

// Analytics API methods
export const analyticsApi = {
  trackView: async (portfolioId: number) => {
    return api.post<{ status: string }>(`/analytics/portfolios/${portfolioId}/track-view/`, {});
  },

  trackClick: async (portfolioId: number, elementId: string, elementType: string) => {
    return api.post<{ status: string }>(`/analytics/portfolios/${portfolioId}/track-click/`, {
      element_id: elementId,
      element_type: elementType,
    });
  },

  getPortfolioStats: async (portfolioId: number) => {
    return api.get<{
      total_views: number;
      unique_visitors: number;
      total_clicks: number;
      avg_session_duration: number;
    }>(`/analytics/portfolios/${portfolioId}/stats/`);
  },

  getPortfolioViews: async (portfolioId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return api.get<Array<{
      date: string;
      views: number;
      unique_visitors: number;
    }>>(`/analytics/portfolios/${portfolioId}/views/?${params.toString()}`);
  },

  getPortfolioClicks: async (portfolioId: number) => {
    return api.get<Array<{
      element_id: string;
      element_type: string;
      count: number;
    }>>(`/analytics/portfolios/${portfolioId}/clicks/`);
  },

  getPortfolioReports: async (portfolioId: number) => {
    return api.get<Array<{
      date: string;
      total_views: number;
      unique_visitors: number;
      total_clicks: number;
      avg_session_duration: number;
    }>>(`/analytics/portfolios/${portfolioId}/reports/`);
  },
};

// Export API methods
export const exportApi = {
  exportHTML: async (portfolioId: number) => {
    return api.post<{
      job_id: number;
      status: string;
      message: string;
    }>(`/export/html/${portfolioId}/`);
  },

  exportPDF: async (portfolioId: number) => {
    return api.post<{
      job_id: number;
      status: string;
      message: string;
    }>(`/export/pdf/${portfolioId}/`);
  },

  getExportJob: async (jobId: number) => {
    return api.get<{
      id: number;
      status: string;
      export_type?: string;
      file_path: string | null;
      error_message: string | null;
      error_type?: string;
      instructions?: {
        title?: string;
        instructions?: string[];
        docs_url?: string;
      };
      created_at: string;
      completed_at: string | null;
    }>(`/export/jobs/${jobId}/`);
  },

  downloadExport: async (jobId: number) => {
    return api.get(`/export/jobs/${jobId}/download/`, {
      headers: {},
    });
  },
};

// SEO API methods
export const seoApi = {
  analyzeSEO: async (portfolioId: number) => {
    return api.post<{
      score: number;
      recommendations: Array<{
        type: string;
        message: string;
        priority: 'high' | 'medium' | 'low';
      }>;
      keyword_density: Record<string, number>;
      meta_tags: {
        title: boolean;
        description: boolean;
        keywords: boolean;
      };
      content_length: number;
      readability_score: number;
      image_alt_text: {
        total: number;
        with_alt: number;
      };
      links: {
        internal: number;
        external: number;
      };
    }>('/ai/analyze-seo/', { portfolio_id: portfolioId });
  },
};

// Dashboard API methods
export const dashboardApi = {
  getStats: async () => {
    return api.get<{
      total_portfolios: number;
      published_count: number;
      drafts_count: number;
      recent_activity: Array<{
        type: string;
        description: string;
        timestamp: string;
      }>;
    }>('/dashboard/stats/');
  },
};

// Create API client instance
export const api = new ApiClient(API_URL);

export default api;

