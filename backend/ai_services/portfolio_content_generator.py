"""
AI portfolio content generation service
"""
from typing import Dict, Any, List
from .gemini_client import gemini_client as openai_client


def generate_portfolio_keywords(portfolio_data: Dict[str, Any]) -> List[str]:
    """
    Generate SEO keywords for portfolio based on content
    
    Args:
        portfolio_data: Portfolio data including title, components, etc.
    
    Returns:
        List of suggested keywords
    """
    title = portfolio_data.get('title', '')
    template_type = portfolio_data.get('template_type', 'modern')
    components = portfolio_data.get('components', [])
    
    # Extract content from components
    content_text = title
    skills = []
    for component in components:
        comp_type = component.get('component_type')
        content = component.get('content', {})
        if comp_type in ['about', 'about_me_card']:
            content_text += ' ' + str(content.get('bio', ''))
        elif comp_type in ['skills', 'skills_cloud']:
            skills = content.get('skills', [])
            if isinstance(skills, list):
                content_text += ' ' + ' '.join(skills)
    
    if not openai_client.is_configured():
        # Basic keyword extraction without AI
        keywords = []
        if title:
            keywords.extend(title.lower().split()[:5])
        if skills:
            keywords.extend([s.lower() for s in skills[:5]])
        keywords.extend([template_type, 'portfolio', 'professional'])
        return list(set(keywords))[:10]
    
    prompt = f"""
    Generate 10-15 relevant SEO keywords for a portfolio website with the following information:
    
    Title: {title}
    Template Type: {template_type}
    Skills: {', '.join(skills[:10]) if skills else 'Not specified'}
    Content Summary: {content_text[:500]}
    
    Return a JSON array of keyword strings, focusing on:
    - Professional skills and technologies
    - Industry terms
    - Portfolio-related keywords
    - Relevant job titles or roles
    
    Format: ["keyword1", "keyword2", "keyword3", ...]
    """
    
    result = openai_client.generate_json(prompt)
    if isinstance(result, list):
        return result[:15]
    elif isinstance(result, dict) and 'keywords' in result:
        return result['keywords'][:15]
    else:
        # Fallback
        keywords = []
        if title:
            keywords.extend(title.lower().split()[:5])
        if skills:
            keywords.extend([s.lower() for s in skills[:5]])
        keywords.extend([template_type, 'portfolio', 'professional'])
        return list(set(keywords))[:10]


def generate_component_content(component_type: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate content for a specific component type
    
    Args:
        component_type: Type of component (header, about, skills, etc.)
        context: Context data (resume data, existing content, etc.)
    
    Returns:
        Generated content dictionary
    """
    resume_data = context.get('resume_data', {})
    existing_content = context.get('existing_content', {})
    template_type = context.get('template_type', 'modern')
    
    if not openai_client.is_configured():
        return _generate_placeholder_content(component_type, resume_data, template_type)
    
    if component_type == 'header':
        return _generate_header_content(resume_data, template_type)
    elif component_type == 'hero_banner':
        return _generate_hero_banner_content(resume_data, template_type)
    elif component_type == 'about':
        return _generate_about_content(resume_data, template_type)
    elif component_type == 'about_me_card':
        return _generate_about_me_card_content(resume_data, template_type)
    elif component_type == 'skills':
        return _generate_skills_content(resume_data, existing_content)
    elif component_type == 'skills_cloud':
        return _generate_skills_cloud_content(resume_data, existing_content)
    elif component_type == 'experience_timeline':
        return _generate_experience_timeline_content(resume_data, existing_content)
    elif component_type == 'projects':
        return _generate_projects_content(resume_data, existing_content)
    elif component_type == 'project_grid':
        return _generate_project_grid_content(resume_data, existing_content)
    elif component_type == 'services_section':
        return _generate_services_section_content(resume_data, existing_content)
    elif component_type == 'achievements_counters':
        return _generate_achievements_counters_content(resume_data, existing_content)
    elif component_type == 'testimonials_carousel':
        return _generate_testimonials_carousel_content(resume_data, existing_content)
    elif component_type == 'blog_preview_grid':
        return _generate_blog_preview_grid_content(resume_data, existing_content)
    elif component_type == 'contact':
        return _generate_contact_content(resume_data, existing_content)
    elif component_type == 'contact_form':
        return _generate_contact_form_content(resume_data, existing_content)
    elif component_type == 'footer':
        return _generate_footer_content(resume_data, existing_content)
    else:
        return _generate_placeholder_content(component_type, resume_data, template_type)


def _generate_header_content(resume_data: Dict[str, Any], template_type: str) -> Dict[str, Any]:
    """Generate header component content"""
    name = resume_data.get('name', 'Professional')
    
    # Try to extract professional title from various sources
    title = resume_data.get('title', '')
    if not title:
        # Try from experience (most recent job title)
        experience = resume_data.get('experience', [])
        if experience and isinstance(experience, list) and len(experience) > 0:
            latest_job = experience[0] if isinstance(experience[0], dict) else {}
            title = latest_job.get('title', '') or latest_job.get('position', '')
    
    if not title:
        # Fallback to summary
        summary = resume_data.get('summary', '')
        if summary:
            # Extract first sentence or key phrase
            title = summary.split('.')[0][:100] if summary else 'Professional'
    
    if not title:
        title = 'Professional'
    
    if not openai_client.is_configured():
        subtitle = title[:100] if isinstance(title, str) else 'Professional'
        # Create a more professional subtitle if we have more info
        if resume_data.get('experience'):
            subtitle = f"{title} | Portfolio"
        return {
            'title': name,
            'subtitle': subtitle
        }
    
    # Build context for AI
    experience_summary = ""
    if resume_data.get('experience') and isinstance(resume_data.get('experience'), list):
        exp_list = resume_data.get('experience', [])[:3]  # Top 3 experiences
        experience_summary = ", ".join([
            exp.get('title', '') or exp.get('position', '') 
            for exp in exp_list 
            if isinstance(exp, dict)
        ])
    
    prompt = f"""
    Create a professional header for a {template_type} portfolio template with:
    Name: {name}
    Professional Title: {title}
    Experience: {experience_summary}
    Template Style: {template_type}
    
    Generate a compelling professional subtitle that:
    - Highlights the person's expertise or role
    - Is concise and impactful (max 100 characters)
    - Matches the {template_type} template style
    
    Return JSON:
    {{
        "title": "{name}",
        "subtitle": "Professional tagline or role description"
    }}
    """
    
    try:
        result = openai_client.generate_json(prompt)
        if isinstance(result, dict) and 'subtitle' in result:
            return {
                'title': result.get('title', name),
                'subtitle': result.get('subtitle', title[:100])
            }
    except:
        pass
    
    return {
        'title': name, 
        'subtitle': title[:100] if isinstance(title, str) else 'Professional'
    }


def _generate_about_content(resume_data: Dict[str, Any], template_type: str) -> Dict[str, Any]:
    """Generate about/bio component content"""
    from .content_generator import generate_bio
    
    bio = generate_bio(resume_data)
    
    return {'bio': bio}


def _generate_skills_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate skills component content"""
    skills = resume_data.get('skills', [])
    
    # If skills is not a list, try to convert it
    if skills and not isinstance(skills, list):
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',')]
        else:
            skills = [str(skills)]
    
    # If no skills from resume, check existing content
    if not skills:
        existing_skills = existing_content.get('skills', [])
        if existing_skills:
            skills = existing_skills if isinstance(existing_skills, list) else [existing_skills]
    
    # If still no skills, use default
    if not skills:
        skills = ['Communication', 'Problem Solving', 'Teamwork']
    
    # Ensure skills are strings and filter out empty ones
    skills = [str(skill).strip() for skill in skills if skill and str(skill).strip()]
    
    # Remove duplicates while preserving order
    seen = set()
    unique_skills = []
    for skill in skills:
        skill_lower = skill.lower()
        if skill_lower not in seen:
            seen.add(skill_lower)
            unique_skills.append(skill)
    
    return {'skills': unique_skills[:20]}  # Limit to top 20 skills


def _generate_projects_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate projects component content"""
    projects = existing_content.get('projects', [])
    if not projects:
        return {'projects': []}
    return {'projects': projects}


def _generate_contact_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate contact component content"""
    email = resume_data.get('email', '')
    phone = resume_data.get('phone', '')
    
    # Extract social links from resume data
    linkedin = resume_data.get('linkedin', '') or resume_data.get('linkedin_url', '')
    github = resume_data.get('github', '') or resume_data.get('github_url', '')
    website = resume_data.get('website', '') or resume_data.get('portfolio_url', '')
    
    # Also check in social links object
    social = resume_data.get('social', {})
    if isinstance(social, dict):
        linkedin = linkedin or social.get('linkedin', '') or social.get('LinkedIn', '')
        github = github or social.get('github', '') or social.get('GitHub', '')
        website = website or social.get('website', '') or social.get('portfolio', '')
    
    # Extract location if available
    location = resume_data.get('location', '') or resume_data.get('address', '')
    
    return {
        'email': email or existing_content.get('email', ''),
        'phone': phone or existing_content.get('phone', ''),
        'location': location or existing_content.get('location', ''),
        'social': {
            'linkedin': linkedin or existing_content.get('social', {}).get('linkedin', ''),
            'github': github or existing_content.get('social', {}).get('github', ''),
            'website': website or existing_content.get('social', {}).get('website', ''),
            **existing_content.get('social', {})
        }
    }


def _generate_hero_banner_content(resume_data: Dict[str, Any], template_type: str) -> Dict[str, Any]:
    """Generate hero banner component content"""
    name = resume_data.get('name', 'Professional')
    title = resume_data.get('title', '') or (resume_data.get('experience', [{}])[0] if resume_data.get('experience') else {}).get('title', 'Professional')
    
    return {
        'title': name,
        'subtitle': title[:100] if title else 'Welcome to My Portfolio',
        'background_image': '',
        'background_video': '',
        'cta_buttons': [
            {'text': 'View My Work', 'url': '#projects', 'variant': 'primary'},
            {'text': 'Contact Me', 'url': '#contact', 'variant': 'secondary'}
        ],
        'overlay_opacity': 0.5
    }


def _generate_about_me_card_content(resume_data: Dict[str, Any], template_type: str) -> Dict[str, Any]:
    """Generate about me card component content"""
    name = resume_data.get('name', 'Professional')
    title = resume_data.get('title', 'Professional')
    bio = resume_data.get('summary', f'I am {name}, a dedicated professional passionate about delivering excellence.')
    
    linkedin = resume_data.get('linkedin', '') or resume_data.get('linkedin_url', '')
    github = resume_data.get('github', '') or resume_data.get('github_url', '')
    email = resume_data.get('email', '')
    
    return {
        'name': name,
        'title': title,
        'bio': bio,
        'image': '',
        'social_links': {
            'linkedin': linkedin,
            'github': github,
            'twitter': '',
            'email': email
        }
    }


def _generate_skills_cloud_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate skills cloud component content"""
    skills = resume_data.get('skills', [])
    
    if skills and not isinstance(skills, list):
        if isinstance(skills, str):
            skills = [s.strip() for s in skills.split(',')]
        else:
            skills = [str(skills)]
    
    if not skills:
        existing_skills = existing_content.get('skills', [])
        if existing_skills:
            skills = existing_skills if isinstance(existing_skills, list) else [existing_skills]
    
    if not skills:
        skills = ['Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Project Management']
    
    skills = [str(skill).strip() for skill in skills if skill and str(skill).strip()]
    
    seen = set()
    unique_skills = []
    for skill in skills:
        skill_lower = skill.lower()
        if skill_lower not in seen:
            seen.add(skill_lower)
            unique_skills.append(skill)
    
    return {
        'skills': unique_skills[:30],
        'display_mode': 'cloud'
    }


def _generate_experience_timeline_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate experience timeline component content"""
    experiences = resume_data.get('experience', [])
    
    if not experiences and existing_content.get('experiences'):
        experiences = existing_content.get('experiences', [])
    
    formatted_experiences = []
    for exp in experiences[:10]:  # Limit to 10 most recent
        if isinstance(exp, dict):
            formatted_experiences.append({
                'title': exp.get('title', '') or exp.get('position', 'Position'),
                'company': exp.get('company', 'Company'),
                'start_date': exp.get('start_date', ''),
                'end_date': exp.get('end_date', ''),
                'description': exp.get('description', '') or ' '.join(exp.get('responsibilities', []))
            })
    
    return {'experiences': formatted_experiences}


def _generate_project_grid_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate project grid component content"""
    projects = existing_content.get('projects', [])
    
    # Try to convert experience to projects if no projects exist
    if not projects and resume_data.get('experience'):
        experiences = resume_data.get('experience', [])[:5]
        projects = []
        for exp in experiences:
            if isinstance(exp, dict):
                projects.append({
                    'title': (exp.get('title', '') or exp.get('position', '')) + ' at ' + exp.get('company', ''),
                    'description': exp.get('description', '') or ' '.join(exp.get('responsibilities', [])),
                    'short_description': (exp.get('description', '') or ' '.join(exp.get('responsibilities', [])))[:200],
                    'image': '',
                    'github_url': '',
                    'live_url': '',
                    'technologies': []
                })
    
    return {
        'projects': projects,
        'filter_categories': [],
        'show_filters': True
    }


def _generate_services_section_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate services section component content"""
    services = existing_content.get('services', [])
    
    if not services:
        # Generate default services based on skills or experience
        skills = resume_data.get('skills', [])
        if isinstance(skills, list) and skills:
            services = [{'title': skill, 'description': f'Professional {skill} services', 'icon': 'Code'} for skill in skills[:6]]
        else:
            services = [
                {'title': 'Web Development', 'description': 'Custom web solutions tailored to your needs', 'icon': 'Code'},
                {'title': 'Consulting', 'description': 'Expert advice and strategic guidance', 'icon': 'Briefcase'},
                {'title': 'Design', 'description': 'Creative and user-centered design solutions', 'icon': 'Palette'}
            ]
    
    return {'services': services}


def _generate_achievements_counters_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate achievements counters component content"""
    counters = existing_content.get('counters', [])
    
    if not counters:
        # Generate default counters
        projects_count = len(existing_content.get('projects', [])) or len(resume_data.get('experience', []))
        counters = [
            {'label': 'Projects Completed', 'value': max(projects_count, 5), 'icon': 'Briefcase'},
            {'label': 'Years Experience', 'value': max(len(resume_data.get('experience', [])), 2), 'icon': 'Calendar'},
            {'label': 'Happy Clients', 'value': max(projects_count * 2, 10), 'icon': 'Users'},
            {'label': 'Skills Mastered', 'value': len(resume_data.get('skills', [])) or 10, 'icon': 'Award'}
        ]
    
    return {'counters': counters}


def _generate_testimonials_carousel_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate testimonials carousel component content"""
    testimonials = existing_content.get('testimonials', [])
    
    if not testimonials:
        testimonials = [
            {
                'name': 'Client Name',
                'role': 'CEO, Company',
                'content': 'Outstanding work and professionalism. Highly recommended!',
                'avatar': '',
                'rating': 5
            }
        ]
    
    return {'testimonials': testimonials}


def _generate_blog_preview_grid_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate blog preview grid component content"""
    posts = existing_content.get('posts', [])
    
    return {
        'posts': posts,
        'posts_per_row': 3
    }


def _generate_contact_form_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate contact form component content"""
    return {
        'title': 'Contact Info',
        'description': 'Feel free to reach out for collaborations, opportunities, or just to say hello!',
        'fields': ['name', 'email', 'message'],
        'submit_button_text': 'Send Message'
    }


def _generate_footer_content(resume_data: Dict[str, Any], existing_content: Dict[str, Any]) -> Dict[str, Any]:
    """Generate footer component content"""
    name = resume_data.get('name', 'Professional')
    year = 2024  # Could use current year
    
    linkedin = resume_data.get('linkedin', '') or resume_data.get('linkedin_url', '')
    github = resume_data.get('github', '') or resume_data.get('github_url', '')
    website = resume_data.get('website', '') or resume_data.get('portfolio_url', '')
    
    return {
        'copyright_text': f'© {year} {name}. All rights reserved.',
        'links': [
            {'text': 'About', 'url': '#about'},
            {'text': 'Projects', 'url': '#projects'},
            {'text': 'Contact', 'url': '#contact'}
        ],
        'social_links': {
            'linkedin': linkedin,
            'github': github,
            'twitter': '',
            'facebook': '',
            'instagram': ''
        },
        'columns': []
    }


def _generate_placeholder_content(component_type: str, resume_data: Dict[str, Any], template_type: str) -> Dict[str, Any]:
    """Generate placeholder content when AI is not available"""
    name = resume_data.get('name', 'Professional')
    
    placeholders = {
        'header': {'title': name, 'subtitle': 'Professional Portfolio'},
        'hero_banner': {
            'title': name,
            'subtitle': 'Welcome to My Portfolio',
            'background_image': '',
            'background_video': '',
            'cta_buttons': [{'text': 'Get Started', 'url': '#', 'variant': 'primary'}],
            'overlay_opacity': 0.5
        },
        'about': {'bio': f'I am {name}, a dedicated professional passionate about delivering excellence.'},
        'about_me_card': {
            'name': name,
            'title': 'Professional',
            'bio': f'I am {name}, a dedicated professional passionate about delivering excellence.',
            'image': '',
            'social_links': {'linkedin': '', 'github': '', 'twitter': '', 'email': ''}
        },
        'skills': {'skills': ['Communication', 'Problem Solving', 'Teamwork']},
        'skills_cloud': {'skills': ['Communication', 'Problem Solving', 'Teamwork', 'Leadership'], 'display_mode': 'cloud'},
        'experience_timeline': {'experiences': []},
        'projects': {'projects': []},
        'project_grid': {'projects': [], 'filter_categories': [], 'show_filters': True},
        'services_section': {'services': []},
        'achievements_counters': {'counters': []},
        'testimonials_carousel': {'testimonials': []},
        'blog_preview_grid': {'posts': [], 'posts_per_row': 3},
        'contact': {'email': '', 'phone': '', 'linkedin': '', 'github': ''},
        'contact_form': {
            'title': 'Contact Info',
            'description': '',
            'fields': ['name', 'email', 'message'],
            'submit_button_text': 'Send Message'
        },
        'footer': {
            'copyright_text': f'© 2024 {name}. All rights reserved.',
            'links': [],
            'social_links': {},
            'columns': []
        }
    }
    
    return placeholders.get(component_type, {})


def optimize_seo_content(portfolio: Dict[str, Any]) -> Dict[str, Any]:
    """
    Optimize existing portfolio content for SEO
    
    Args:
        portfolio: Portfolio data dictionary
    
    Returns:
        Optimized content with suggestions
    """
    from .seo_analyzer import analyze_seo
    
    # Extract content for SEO analysis
    content_text = portfolio.get('title', '')
    components = portfolio.get('components', [])
    
    for component in components:
        comp_type = component.get('component_type')
        content = component.get('content', {})
        if comp_type in ['about', 'about_me_card']:
            content_text += ' ' + str(content.get('bio', ''))
        elif comp_type in ['skills', 'skills_cloud']:
            skills = content.get('skills', [])
            if isinstance(skills, list):
                content_text += ' ' + ' '.join(skills)
    
    seo_data = {
        'title': portfolio.get('seo_title') or portfolio.get('title', ''),
        'description': portfolio.get('seo_description') or portfolio.get('meta_description', ''),
        'keywords': portfolio.get('seo_keywords') or portfolio.get('meta_keywords', ''),
        'content_text': content_text
    }
    
    analysis = analyze_seo(seo_data)
    
    # Generate optimized versions if AI is available
    optimized = {}
    if openai_client.is_configured():
        if not seo_data['description'] or analysis['score'] < 70:
            optimized['meta_description'] = generate_meta_description(portfolio)
        if not seo_data['keywords'] or analysis['score'] < 70:
            optimized['meta_keywords'] = ', '.join(generate_portfolio_keywords(portfolio))
    
    return {
        'analysis': analysis,
        'optimized': optimized,
        'recommendations': analysis.get('recommendations', [])
    }


def generate_meta_description(portfolio: Dict[str, Any]) -> str:
    """
    Generate SEO meta description for portfolio
    
    Args:
        portfolio: Portfolio data
    
    Returns:
        Generated meta description
    """
    title = portfolio.get('title', '')
    template_type = portfolio.get('template_type', 'modern')
    components = portfolio.get('components', [])
    
    # Extract key info
    bio = ''
    skills = []
    for component in components:
        comp_type = component.get('component_type')
        content = component.get('content', {})
        if comp_type in ['about', 'about_me_card']:
            bio = content.get('bio', '')
        elif comp_type in ['skills', 'skills_cloud']:
            skills = content.get('skills', [])
    
    if not openai_client.is_configured():
        # Basic description
        desc = f"{title} - Professional portfolio"
        if bio:
            desc += f". {bio[:100]}"
        return desc[:160]
    
    prompt = f"""
    Create a compelling SEO meta description (120-160 characters) for a portfolio:
    
    Title: {title}
    Template: {template_type}
    Bio Summary: {bio[:200] if bio else 'Professional portfolio'}
    Skills: {', '.join(skills[:5]) if skills else 'Various skills'}
    
    Requirements:
    - 120-160 characters
    - Include key skills or expertise
    - Compelling and professional
    - No quotes or special formatting
    
    Return only the description text.
    """
    
    result = openai_client.generate_text(prompt, max_tokens=200)
    if result:
        return result[:160]
    return f"{title} - Professional portfolio showcasing skills and experience"[:160]


def suggest_improvements(portfolio: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Suggest improvements for portfolio content
    
    Args:
        portfolio: Portfolio data
    
    Returns:
        List of improvement suggestions
    """
    suggestions = []
    components = portfolio.get('components', [])
    
    # Check for missing components
    component_types = [c.get('component_type') for c in components]
    required_components = ['header', 'about', 'contact']
    
    # Check for header or hero_banner
    if 'header' not in component_types and 'hero_banner' not in component_types:
        suggestions.append({
            'type': 'missing_component',
            'component': 'header',
            'priority': 'high',
            'message': 'Consider adding a header or hero banner component to your portfolio',
            'action': 'add_header'
        })
    
    # Check for about or about_me_card
    if 'about' not in component_types and 'about_me_card' not in component_types:
        suggestions.append({
            'type': 'missing_component',
            'component': 'about',
            'priority': 'high',
            'message': 'Consider adding an about section to your portfolio',
            'action': 'add_about'
        })
    
    # Check for contact or contact_form
    if 'contact' not in component_types and 'contact_form' not in component_types:
        suggestions.append({
            'type': 'missing_component',
            'component': 'contact',
            'priority': 'high',
            'message': 'Consider adding a contact section to your portfolio',
            'action': 'add_contact'
        })
    
    # Check for empty content
    for component in components:
        comp_type = component.get('component_type')
        content = component.get('content', {})
        
        if comp_type in ['about', 'about_me_card'] and not content.get('bio'):
            suggestions.append({
                'type': 'empty_content',
                'component': comp_type,
                'priority': 'high',
                'message': 'About section is empty. Add a bio to introduce yourself.',
                'action': 'fill_about'
            })
        elif comp_type in ['skills', 'skills_cloud'] and not content.get('skills'):
            suggestions.append({
                'type': 'empty_content',
                'component': comp_type,
                'priority': 'medium',
                'message': 'Skills section is empty. Add your key skills.',
                'action': 'fill_skills'
            })
        elif comp_type in ['projects', 'project_grid'] and not content.get('projects'):
            suggestions.append({
                'type': 'empty_content',
                'component': comp_type,
                'priority': 'medium',
                'message': 'Projects section is empty. Showcase your work.',
                'action': 'fill_projects'
            })
    
    # SEO suggestions
    if not portfolio.get('meta_description') and not portfolio.get('seo_description'):
        suggestions.append({
            'type': 'seo',
            'priority': 'medium',
            'message': 'Add a meta description for better SEO',
            'action': 'add_meta_description'
        })
    
    if not portfolio.get('meta_keywords') and not portfolio.get('seo_keywords'):
        suggestions.append({
            'type': 'seo',
            'priority': 'low',
            'message': 'Add keywords for better SEO',
            'action': 'add_keywords'
        })
    
    # Profile photo suggestion
    if not portfolio.get('profile_photo'):
        suggestions.append({
            'type': 'profile',
            'priority': 'low',
            'message': 'Add a profile photo to personalize your portfolio',
            'action': 'add_profile_photo'
        })
    
    return suggestions

