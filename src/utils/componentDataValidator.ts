/**
 * Utility functions for validating and normalizing portfolio component data
 */

export interface ValidatedProject {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  image?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  technologies?: string[];
}

export interface ValidatedBlogPost {
  id: number;
  title: string;
  excerpt?: string;
  content_markdown?: string;
  featured_image?: string | null;
  published: boolean;
  published_date?: string;
}

/**
 * Normalize skills array from various formats
 */
export function normalizeSkills(skills: any): string[] {
  if (!skills) return [];
  
  if (Array.isArray(skills)) {
    return skills
      .map(skill => {
        if (typeof skill === 'string') return skill.trim();
        if (typeof skill === 'object' && skill?.name) return String(skill.name).trim();
        return String(skill).trim();
      })
      .filter(skill => skill.length > 0);
  }
  
  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }
  
  return [];
}

/**
 * Validate and normalize project data
 */
export function validateProject(project: any): ValidatedProject | null {
  if (!project) return null;
  
  // Handle project ID (need to resolve to full object)
  if (typeof project === 'number') {
    return null; // Need to resolve ID to full object
  }
  
  // Handle project object
  if (typeof project === 'object') {
    // Must have at least id and title
    if (!project.id || !project.title) {
      return null;
    }
    
    return {
      id: Number(project.id),
      title: String(project.title || 'Untitled Project'),
      description: String(project.description || project.short_description || ''),
      short_description: project.short_description 
        ? String(project.short_description)
        : project.description 
        ? String(project.description).substring(0, 200) + (project.description.length > 200 ? '...' : '')
        : undefined,
      image: project.image || null,
      github_url: project.github_url || project.github || null,
      live_url: project.live_url || project.website || project.live || null,
      technologies: normalizeSkills(project.technologies || project.tags || []),
    };
  }
  
  return null;
}

/**
 * Validate and normalize projects array
 */
export function validateProjects(projects: any): ValidatedProject[] {
  if (!projects) return [];
  
  if (!Array.isArray(projects)) {
    return [];
  }
  
  const validated: ValidatedProject[] = [];
  
  for (const project of projects) {
    const validatedProject = validateProject(project);
    if (validatedProject) {
      validated.push(validatedProject);
    }
  }
  
  return validated;
}

/**
 * Validate and normalize blog post data
 */
export function validateBlogPost(post: any): ValidatedBlogPost | null {
  if (!post) return null;
  
  // Handle post ID (need to resolve to full object)
  if (typeof post === 'number') {
    return null; // Need to resolve ID to full object
  }
  
  // Handle post object
  if (typeof post === 'object') {
    // Must have at least id and title
    if (!post.id || !post.title) {
      return null;
    }
    
    return {
      id: Number(post.id),
      title: String(post.title || 'Untitled Post'),
      excerpt: post.excerpt ? String(post.excerpt) : undefined,
      content_markdown: post.content_markdown || post.content || undefined,
      featured_image: post.featured_image || post.image || null,
      published: Boolean(post.published),
      published_date: post.published_date || post.created_at || undefined,
    };
  }
  
  return null;
}

/**
 * Validate and normalize blog posts array
 */
export function validateBlogPosts(posts: any): ValidatedBlogPost[] {
  if (!posts) return [];
  
  if (!Array.isArray(posts)) {
    return [];
  }
  
  const validated: ValidatedBlogPost[] = [];
  
  for (const post of posts) {
    const validatedPost = validateBlogPost(post);
    if (validatedPost) {
      validated.push(validatedPost);
    }
  }
  
  return validated;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;
  
  // Add https:// if no protocol
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  
  // Validate URL format
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') return null;
  
  const trimmed = email.trim();
  if (trimmed.length === 0) return null;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return trimmed;
  }
  
  return null;
}

/**
 * Normalize component content
 */
export function normalizeComponentContent(component: any): Record<string, any> {
  if (!component || typeof component !== 'object') {
    return {};
  }
  
  const content = component.content || {};
  const normalized: Record<string, any> = {};
  
  // Normalize based on component type
  switch (component.component_type) {
    case 'header':
      normalized.title = content.title || '';
      normalized.subtitle = content.subtitle || '';
      break;
    
    case 'about':
      normalized.bio = content.bio || '';
      break;
    
    case 'skills':
      normalized.skills = normalizeSkills(content.skills);
      break;
    
    case 'projects':
      normalized.projects = validateProjects(content.projects);
      break;
    
    case 'blog':
      normalized.posts = validateBlogPosts(content.posts);
      break;
    
    case 'contact':
      normalized.email = validateEmail(content.email);
      normalized.phone = content.phone ? String(content.phone).trim() : null;
      normalized.location = content.location ? String(content.location).trim() : null;
      normalized.social = {
        linkedin: validateUrl(content.linkedin || content.social?.linkedin),
        github: validateUrl(content.github || content.social?.github),
        website: validateUrl(content.website || content.social?.website),
      };
      break;
    
    default:
      return content;
  }
  
  return normalized;
}

