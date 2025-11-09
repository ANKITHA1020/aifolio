"""
Django management command to seed portfolio templates
"""
from django.core.management.base import BaseCommand
from portfolios.models import Template


class Command(BaseCommand):
    help = 'Seed portfolio templates'

    def handle(self, *args, **options):
        templates_data = [
            {
                'name': 'Classic',
                'type': 'classic',
                'description': 'A timeless, professional design perfect for any industry. Clean layout with traditional sections.',
                'config': {
                    'primary_color': '#2563eb',
                    'secondary_color': '#64748b',
                    'font_family': 'Georgia, serif',
                    'layout': 'traditional',
                    'sections': ['header', 'about', 'experience', 'education', 'skills', 'contact']
                },
                'is_active': True
            },
            {
                'name': 'Modern',
                'type': 'modern',
                'description': 'Contemporary design with bold typography and clean aesthetics. Perfect for creative professionals.',
                'config': {
                    'primary_color': '#7c3aed',
                    'secondary_color': '#a78bfa',
                    'font_family': 'Inter, sans-serif',
                    'layout': 'modern',
                    'sections': ['header', 'about', 'projects', 'skills', 'contact']
                },
                'is_active': True
            },
            {
                'name': 'Minimalist',
                'type': 'minimalist',
                'description': 'Simple and elegant design with focus on content. Minimal distractions, maximum impact.',
                'config': {
                    'primary_color': '#000000',
                    'secondary_color': '#6b7280',
                    'font_family': 'Helvetica, sans-serif',
                    'layout': 'minimal',
                    'sections': ['header', 'about', 'experience', 'contact']
                },
                'is_active': True
            },
            {
                'name': 'Developer',
                'type': 'developer',
                'description': 'Designed for software developers and engineers. Showcase your code, projects, and technical skills.',
                'config': {
                    'primary_color': '#10b981',
                    'secondary_color': '#6ee7b7',
                    'font_family': 'Monaco, monospace',
                    'layout': 'developer',
                    'sections': ['header', 'about', 'projects', 'skills', 'experience', 'contact']
                },
                'is_active': True
            },
            {
                'name': 'Designer',
                'type': 'designer',
                'description': 'Perfect for designers and creatives. Showcase your portfolio with stunning visuals and gallery layouts.',
                'config': {
                    'primary_color': '#f59e0b',
                    'secondary_color': '#fbbf24',
                    'font_family': 'Poppins, sans-serif',
                    'layout': 'designer',
                    'sections': ['header', 'about', 'projects', 'skills', 'contact']
                },
                'is_active': True
            }
        ]

        created_count = 0
        updated_count = 0

        for template_data in templates_data:
            template, created = Template.objects.get_or_create(
                name=template_data['name'],
                defaults={
                    'type': template_data['type'],
                    'description': template_data['description'],
                    'config': template_data['config'],
                    'is_active': template_data['is_active']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created template: {template.name}')
                )
            else:
                # Update existing template
                template.type = template_data['type']
                template.description = template_data['description']
                template.config = template_data['config']
                template.is_active = template_data['is_active']
                template.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated template: {template.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Seeding complete! Created: {created_count}, Updated: {updated_count}'
            )
        )

