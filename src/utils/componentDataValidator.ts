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
    case 'hero_banner': {
      normalized.title = content.title || '';
      normalized.subtitle = content.subtitle || '';
      normalized.background_image = content.background_image || '';
      normalized.background_video = content.background_video || '';
      normalized.overlay_opacity = Math.min(
        1,
        Math.max(0, typeof content.overlay_opacity === 'number' ? content.overlay_opacity : 0.5),
      );
      normalized.cta_buttons = Array.isArray(content.cta_buttons)
        ? content.cta_buttons.map((button: any) => ({
            text: button?.text || 'Get Started',
            url: button?.url || '#',
            variant: ['secondary', 'ghost'].includes(button?.variant) ? button.variant : 'primary',
          }))
        : [];
      break;
    }

    case 'about_me_card': {
      normalized.name = content.name || '';
      normalized.title = content.title || '';
      normalized.bio = content.bio || '';
      normalized.image = content.image || '';
      normalized.social_links = {
        linkedin: validateUrl(content.social_links?.linkedin || content.linkedin),
        github: validateUrl(content.social_links?.github || content.github),
        twitter: validateUrl(content.social_links?.twitter || content.twitter),
        email: validateEmail(content.social_links?.email || content.email),
        website: validateUrl(content.social_links?.website || content.website),
      };
      break;
    }

    case 'skills_cloud': {
      normalized.skills = normalizeSkills(content.skills);
      normalized.display_mode = content.display_mode === 'bars' ? 'bars' : 'cloud';
      break;
    }

    case 'experience_timeline': {
      const experiences = Array.isArray(content.experiences) ? content.experiences : [];
      normalized.experiences = experiences.map((exp: any) => ({
        title: exp?.title || exp?.position || '',
        company: exp?.company || '',
        startDate: exp?.startDate || exp?.start_date || '',
        endDate: exp?.endDate || exp?.end_date || '',
        description: exp?.description || '',
        location: exp?.location || '',
      })).filter((exp: any) => exp.title || exp.company || exp.description);
      break;
    }

    case 'project_grid': {
      normalized.projects = validateProjects(content.projects);
      normalized.filter_categories = Array.isArray(content.filter_categories)
        ? content.filter_categories
            .map((category: any) => String(category || '').trim())
            .filter((category: string) => category.length > 0)
        : [];
      normalized.show_filters = Boolean(
        content.show_filters === undefined ? true : content.show_filters,
      );
      normalized.code_snippets = Array.isArray(content.code_snippets)
        ? content.code_snippets
            .map((snippet: any) => ({
              language: snippet?.language || 'text',
              code: snippet?.code || '',
              description: snippet?.description || '',
              filename: snippet?.filename || '',
            }))
            .filter((snippet: any) => snippet.code)
        : [];
      break;
    }

    case 'services_section': {
      const services = Array.isArray(content.services) ? content.services : [];
      normalized.services = services
        .map((service: any) => ({
          title: service?.title || '',
          description: service?.description || '',
          icon: service?.icon || '',
        }))
        .filter((service: any) => service.title || service.description);
      break;
    }

    case 'achievements_counters': {
      const counters = Array.isArray(content.counters) ? content.counters : [];
      normalized.counters = counters
        .map((counter: any) => ({
          label: counter?.label || '',
          value: Number(counter?.value ?? 0),
          prefix: counter?.prefix || '',
          suffix: counter?.suffix || '',
        }))
        .filter((counter: any) => counter.label || counter.value);
      break;
    }

    case 'testimonials_carousel': {
      const testimonials = Array.isArray(content.testimonials) ? content.testimonials : [];
      normalized.testimonials = testimonials
        .map((testimonial: any) => ({
          name: testimonial?.name || '',
          role: testimonial?.role || '',
          company: testimonial?.company || '',
          content: testimonial?.content || testimonial?.quote || '',
          image: testimonial?.image || '',
          rating: Math.min(5, Math.max(1, Number(testimonial?.rating) || 0)),
        }))
        .filter((testimonial: any) => testimonial.content);
      break;
    }

    case 'blog_preview_grid': {
      normalized.posts = validateBlogPosts(content.posts);
      const defaultPostsPerRow = 3;
      const parsedValue = Number(content.posts_per_row);
      normalized.posts_per_row =
        parsedValue >= 1 && parsedValue <= 4 ? parsedValue : defaultPostsPerRow;
      break;
    }

    case 'contact_form': {
      normalized.title = content.title || 'Get In Touch';
      normalized.description = content.description || '';
      const allowedFields = ['name', 'email', 'phone', 'subject', 'message', 'company', 'budget'];
      const fields = Array.isArray(content.fields) ? content.fields : ['name', 'email', 'message'];
      normalized.fields = fields
        .map((field: any) => String(field || '').toLowerCase().trim())
        .filter((field: string, index: number, self: string[]) => field && allowedFields.includes(field) && self.indexOf(field) === index);
      if (normalized.fields.length === 0) {
        normalized.fields = ['name', 'email', 'message'];
      }
      normalized.submit_button_text = content.submit_button_text || 'Send Message';
      break;
    }

    case 'footer': {
      normalized.copyright_text = content.copyright_text || '';
      normalized.links = Array.isArray(content.links)
        ? content.links
            .map((link: any) => ({
              text: link?.text || '',
              url: link?.url || '#',
            }))
            .filter((link: any) => link.text)
        : [];
      const columns = Array.isArray(content.columns) ? content.columns : [];
      normalized.columns = columns
        .map((column: any) => ({
          title: column?.title || '',
          links: Array.isArray(column?.links)
            ? column.links
                .map((link: any) => ({
                  text: link?.text || '',
                  url: link?.url || '#',
                }))
                .filter((link: any) => link.text)
            : [],
        }))
        .filter((column: any) => column.title || column.links.length > 0);
      normalized.social_links = {
        linkedin: validateUrl(content.social_links?.linkedin || content.linkedin),
        github: validateUrl(content.social_links?.github || content.github),
        twitter: validateUrl(content.social_links?.twitter || content.twitter),
        facebook: validateUrl(content.social_links?.facebook || content.facebook),
        instagram: validateUrl(content.social_links?.instagram || content.instagram),
        youtube: validateUrl(content.social_links?.youtube || content.youtube),
        website: validateUrl(content.social_links?.website || content.website),
      };
      break;
    }

    default:
      return content;
  }
  
  return normalized;
}

