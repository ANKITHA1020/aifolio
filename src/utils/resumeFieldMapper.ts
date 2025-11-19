/**
 * Utility functions for mapping resume data to portfolio components
 */

export interface ResumeData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  address?: string;
  summary?: string;
  title?: string;
  experience?: Array<{
    title?: string;
    position?: string;
    company?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    responsibilities?: string[];
    location?: string;
  }>;
  education?: Array<{
    degree?: string;
    institution?: string;
    year?: string;
    field?: string;
  }>;
  skills?: string[] | string;
  certifications?: Array<{
    name?: string;
    issuer?: string;
    date?: string;
  }>;
  social?: {
    linkedin?: string;
    github?: string;
    website?: string;
    portfolio?: string;
  };
  linkedin?: string;
  linkedin_url?: string;
  github?: string;
  github_url?: string;
  website?: string;
  portfolio_url?: string;
}

export interface FieldMapping {
  resumeField: string;
  componentField: string;
  value: any;
  enabled: boolean;
}

export interface MappingPreview {
  [key: string]: any;
}

const normalizeResumeSkills = (skills: ResumeData['skills']): string[] => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills
      .map((skill) => (typeof skill === 'string' ? skill.trim() : String(skill || '').trim()))
      .filter((skill) => skill.length > 0);
  }

  if (typeof skills === 'string') {
    return skills
      .split(',')
      .map((skill) => skill.trim())
      .filter((skill) => skill.length > 0);
  }

  return [];
};

const convertExperienceToTimeline = (
  experience: ResumeData['experience']
): Array<{
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
  location: string;
}> => {
  if (!experience || !Array.isArray(experience)) {
    return [];
  }

  return experience
    .map((exp) => {
      const title = exp?.title || exp?.position || '';
      const company = exp?.company || '';
      const startDate = exp?.start_date || '';
      const endDate = exp?.end_date || '';
      const description =
        exp?.description ||
        (Array.isArray(exp?.responsibilities) ? exp.responsibilities.join('\n') : '');
      const location = exp?.location || '';

      return {
        title,
        company,
        startDate,
        endDate,
        description,
        location,
      };
    })
    .filter(
      (item) =>
        item.title || item.company || item.description || item.startDate || item.endDate
    );
};

/**
 * Get available resume fields organized by category
 */
export function getAvailableResumeFields(resumeData: ResumeData | null): {
  personal: Array<{ name: string; value: any; type: string }>;
  experience: Array<{ name: string; value: any; type: string }>;
  education: Array<{ name: string; value: any; type: string }>;
  skills: Array<{ name: string; value: any; type: string }>;
  contact: Array<{ name: string; value: any; type: string }>;
  certifications: Array<{ name: string; value: any; type: string }>;
} {
  if (!resumeData) {
    return {
      personal: [],
      experience: [],
      education: [],
      skills: [],
      contact: [],
      certifications: [],
    };
  }

  const fields = {
    personal: [] as Array<{ name: string; value: any; type: string }>,
    experience: [] as Array<{ name: string; value: any; type: string }>,
    education: [] as Array<{ name: string; value: any; type: string }>,
    skills: [] as Array<{ name: string; value: any; type: string }>,
    contact: [] as Array<{ name: string; value: any; type: string }>,
    certifications: [] as Array<{ name: string; value: any; type: string }>,
  };

  // Personal info
  if (resumeData.name) {
    fields.personal.push({ name: 'name', value: resumeData.name, type: 'text' });
  }
  if (resumeData.title) {
    fields.personal.push({ name: 'title', value: resumeData.title, type: 'text' });
  }
  if (resumeData.summary) {
    fields.personal.push({ name: 'summary', value: resumeData.summary, type: 'text' });
  }

  // Experience
  if (resumeData.experience && Array.isArray(resumeData.experience) && resumeData.experience.length > 0) {
    fields.experience.push({
      name: 'experience',
      value: resumeData.experience,
      type: 'array',
    });
  }

  // Education
  if (resumeData.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
    fields.education.push({
      name: 'education',
      value: resumeData.education,
      type: 'array',
    });
  }

  // Skills
  if (resumeData.skills) {
    const skillsArray = Array.isArray(resumeData.skills)
      ? resumeData.skills
      : typeof resumeData.skills === 'string'
      ? resumeData.skills.split(',').map(s => s.trim())
      : [];
    
    if (skillsArray.length > 0) {
      fields.skills.push({
        name: 'skills',
        value: skillsArray,
        type: 'array',
      });
    }
  }

  // Contact
  if (resumeData.email) {
    fields.contact.push({ name: 'email', value: resumeData.email, type: 'text' });
  }
  if (resumeData.phone) {
    fields.contact.push({ name: 'phone', value: resumeData.phone, type: 'text' });
  }
  if (resumeData.location || resumeData.address) {
    fields.contact.push({
      name: 'location',
      value: resumeData.location || resumeData.address,
      type: 'text',
    });
  }

  // Social links
  const linkedin = resumeData.linkedin || resumeData.linkedin_url || resumeData.social?.linkedin;
  const github = resumeData.github || resumeData.github_url || resumeData.social?.github;
  const website = resumeData.website || resumeData.portfolio_url || resumeData.social?.website || resumeData.social?.portfolio;

  if (linkedin) {
    fields.contact.push({ name: 'linkedin', value: linkedin, type: 'text' });
  }
  if (github) {
    fields.contact.push({ name: 'github', value: github, type: 'text' });
  }
  if (website) {
    fields.contact.push({ name: 'website', value: website, type: 'text' });
  }

  // Certifications
  if (resumeData.certifications && Array.isArray(resumeData.certifications) && resumeData.certifications.length > 0) {
    fields.certifications.push({
      name: 'certifications',
      value: resumeData.certifications,
      type: 'array',
    });
  }

  return fields;
}

/**
 * Preview field mapping for a component type
 */
export function previewFieldMapping(
  componentType: string,
  resumeData: ResumeData | null,
  selectedFields: Record<string, boolean> = {}
): MappingPreview {
  if (!resumeData) {
    return {};
  }

  const preview: MappingPreview = {};

  const mappings = getDefaultFieldMappings(componentType, resumeData);

  const assignValue = (target: MappingPreview, mapping: FieldMapping) => {
    const path = mapping.componentField.split('.');
    let cursor: any = target;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) {
        cursor[key] = {};
      }
      cursor = cursor[key];
    }
    const finalKey = path[path.length - 1];
    if (finalKey) {
      cursor[finalKey] = mapping.value;
    }
  };

  for (const mapping of mappings) {
    const includeField = selectedFields[mapping.resumeField] !== false;
    if (!includeField) continue;
    assignValue(preview, mapping);
  }

  return preview;
}

/**
 * Get default field mappings for a component type
 */
export function getDefaultFieldMappings(
  componentType: string,
  resumeData: ResumeData | null
): FieldMapping[] {
  if (!resumeData) {
    return [];
  }

  const mappings: FieldMapping[] = [];

  switch (componentType) {
    case 'hero_banner': {
      if (resumeData.name) {
        mappings.push({
          resumeField: 'name',
          componentField: 'title',
          value: resumeData.name,
          enabled: true,
        });
      }
      const headline =
        resumeData.title ||
        resumeData.summary ||
        resumeData.experience?.[0]?.title ||
        resumeData.experience?.[0]?.position ||
        '';
      if (headline) {
        mappings.push({
          resumeField: 'title',
          componentField: 'subtitle',
          value: headline,
          enabled: true,
        });
      }
      if (resumeData.summary) {
        mappings.push({
          resumeField: 'summary',
          componentField: 'subtitle',
          value: resumeData.summary,
          enabled: false,
        });
      }
      break;
    }

    case 'about_me_card': {
      if (resumeData.name) {
        mappings.push({
          resumeField: 'name',
          componentField: 'name',
          value: resumeData.name,
          enabled: true,
        });
      }
      if (resumeData.title) {
        mappings.push({
          resumeField: 'title',
          componentField: 'title',
          value: resumeData.title,
          enabled: true,
        });
      }
      if (resumeData.summary) {
        mappings.push({
          resumeField: 'summary',
          componentField: 'bio',
          value: resumeData.summary,
          enabled: true,
        });
      }
      if (resumeData.email) {
        mappings.push({
          resumeField: 'email',
          componentField: 'social_links.email',
          value: resumeData.email,
          enabled: true,
        });
      }
      const linkedin =
        resumeData.linkedin || resumeData.linkedin_url || resumeData.social?.linkedin;
      const github = resumeData.github || resumeData.github_url || resumeData.social?.github;
      const website =
        resumeData.website ||
        resumeData.portfolio_url ||
        resumeData.social?.website ||
        resumeData.social?.portfolio;
      if (linkedin) {
        mappings.push({
          resumeField: 'linkedin',
          componentField: 'social_links.linkedin',
          value: linkedin,
          enabled: true,
        });
      }
      if (github) {
        mappings.push({
          resumeField: 'github',
          componentField: 'social_links.github',
          value: github,
          enabled: true,
        });
      }
      if (website) {
        mappings.push({
          resumeField: 'website',
          componentField: 'social_links.website',
          value: website,
          enabled: true,
        });
      }
      break;
    }

    case 'skills_cloud': {
      const skillsArray = normalizeResumeSkills(resumeData.skills);
      if (skillsArray.length > 0) {
        mappings.push({
          resumeField: 'skills',
          componentField: 'skills',
          value: skillsArray,
          enabled: true,
        });
      }
      break;
    }

    case 'experience_timeline': {
      const timeline = convertExperienceToTimeline(resumeData.experience);
      if (timeline.length > 0) {
        mappings.push({
          resumeField: 'experience',
          componentField: 'experiences',
          value: timeline,
          enabled: true,
        });
      }
      break;
    }

    case 'project_grid': {
      const projects = convertExperienceToProjects(resumeData.experience || [], []);
      if (projects.length > 0) {
        mappings.push({
          resumeField: 'experience',
          componentField: 'projects',
          value: projects,
          enabled: true,
        });
      }
      break;
    }

    case 'contact_form': {
      if (resumeData.name) {
        mappings.push({
          resumeField: 'name',
          componentField: 'title',
          value: `Contact ${resumeData.name}`,
          enabled: true,
        });
      }
      // Map contact information fields
      if (resumeData.email) {
        mappings.push({
          resumeField: 'email',
          componentField: 'contact_info.email',
          value: resumeData.email,
          enabled: true,
        });
      }
      if (resumeData.phone) {
        mappings.push({
          resumeField: 'phone',
          componentField: 'contact_info.phone',
          value: resumeData.phone,
          enabled: true,
        });
      }
      if (resumeData.location || resumeData.address) {
        mappings.push({
          resumeField: 'location',
          componentField: 'contact_info.location',
          value: resumeData.location || resumeData.address,
          enabled: true,
        });
      }
      const linkedin = resumeData.linkedin || resumeData.linkedin_url || resumeData.social?.linkedin;
      if (linkedin) {
        mappings.push({
          resumeField: 'linkedin',
          componentField: 'contact_info.linkedin',
          value: linkedin,
          enabled: true,
        });
      }
      const github = resumeData.github || resumeData.github_url || resumeData.social?.github;
      if (github) {
        mappings.push({
          resumeField: 'github',
          componentField: 'contact_info.github',
          value: github,
          enabled: true,
        });
      }
      const website = resumeData.website || resumeData.portfolio_url || resumeData.social?.website || resumeData.social?.portfolio;
      if (website) {
        mappings.push({
          resumeField: 'website',
          componentField: 'contact_info.website',
          value: website,
          enabled: true,
        });
      }
      break;
    }
  }

  return mappings;
}

/**
 * Apply field mapping to component content
 */
export function applyFieldMapping(
  componentContent: Record<string, any>,
  resumeData: ResumeData | null,
  fieldMappings: FieldMapping[]
): Record<string, any> {
  if (!resumeData) {
    return componentContent;
  }

  if (!fieldMappings || fieldMappings.length === 0) {
    return componentContent;
  }

  try {
    const newContent = { ...componentContent };

    for (const mapping of fieldMappings) {
      if (!mapping.enabled || !mapping.value) continue;

      try {
        const fieldPath = mapping.componentField.split('.');
        if (fieldPath.length === 0) continue;

        let target: any = newContent;

        // Navigate to the target field (handle nested paths like 'social.linkedin')
        for (let i = 0; i < fieldPath.length - 1; i++) {
          const key = fieldPath[i];
          if (!key) continue;
          
          if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
            target[key] = {};
          }
          target = target[key];
        }

        // Set the value
        const finalKey = fieldPath[fieldPath.length - 1];
        if (finalKey) {
          target[finalKey] = mapping.value;
        }
      } catch (error) {
        console.error(`Error applying mapping for ${mapping.componentField}:`, error);
        // Continue with other mappings
      }
    }

    return newContent;
  } catch (error) {
    console.error('Error in applyFieldMapping:', error);
    return componentContent;
  }
}

/**
 * Map resume data to component content
 */
export function mapResumeToComponent(
  componentType: string,
  resumeData: ResumeData | null,
  options: {
    selectedFields?: Record<string, boolean>;
    mergeWithExisting?: boolean;
    existingContent?: Record<string, any>;
  } = {}
): Record<string, any> {
  if (!resumeData) {
    return options.existingContent || {};
  }

  const { selectedFields = {}, mergeWithExisting = false, existingContent = {} } = options;
  const preview = previewFieldMapping(componentType, resumeData, selectedFields);

  if (mergeWithExisting) {
    return { ...existingContent, ...preview };
  }

  return preview;
}

/**
 * Convert experience entries to project-like format
 */
export function convertExperienceToProjects(
  experience: Array<{
    title?: string;
    position?: string;
    company?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
    responsibilities?: string[];
  }>,
  selectedIndices: number[] = []
): Array<{
  id?: number;
  title: string;
  description: string;
  short_description: string;
  company?: string;
  technologies?: string[];
}> {
  if (!experience || !Array.isArray(experience)) {
    return [];
  }

  const indicesToConvert = selectedIndices.length > 0 
    ? selectedIndices 
    : experience.map((_, idx) => idx);

  return indicesToConvert
    .filter(idx => idx >= 0 && idx < experience.length)
    .map(idx => {
      const exp = experience[idx];
      const title = exp.title || exp.position || 'Project';
      const company = exp.company || '';
      const description = exp.description || 
        (exp.responsibilities && Array.isArray(exp.responsibilities) 
          ? exp.responsibilities.join('. ') 
          : '') ||
        'Project description';
      
      const shortDescription = description.length > 200 
        ? description.substring(0, 200) + '...' 
        : description;

      return {
        title: company ? `${title} at ${company}` : title,
        description,
        short_description: shortDescription,
        company,
        technologies: [],
      };
    });
}

