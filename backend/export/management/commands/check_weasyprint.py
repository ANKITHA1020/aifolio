"""
Django management command to check WeasyPrint installation and availability.

This command verifies if WeasyPrint is installed and can generate PDFs.
It also provides platform-specific installation instructions if WeasyPrint is not available.
"""

from django.core.management.base import BaseCommand
from django.core.management import color
from export.views import check_weasyprint_availability, get_platform_specific_instructions
import platform
import sys


class Command(BaseCommand):
    help = 'Check if WeasyPrint is installed and can generate PDFs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--verbose',
            action='store_true',
            help='Show detailed error information',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write(self.style.SUCCESS('WeasyPrint Installation Check'))
        self.stdout.write(self.style.SUCCESS('=' * 60))
        self.stdout.write('')

        # Check WeasyPrint availability
        try:
            is_available, error_message, error_type = check_weasyprint_availability()
        except Exception as e:
            # If check_weasyprint_availability itself fails (e.g., import error), handle it
            self.stdout.write(self.style.ERROR('✗ Error checking WeasyPrint installation'))
            self.stdout.write('')
            self.stdout.write(self.style.WARNING(f'Error: {str(e)}'))
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('WeasyPrint is not properly installed or system dependencies are missing.'))
            self.stdout.write('')
            
            # Get platform-specific instructions
            try:
                instructions = get_platform_specific_instructions()
                if instructions:
                    self.stdout.write(self.style.WARNING(f'{instructions["title"]}:'))
                    self.stdout.write('')
                    if 'instructions' in instructions and instructions['instructions']:
                        for instruction in instructions['instructions']:
                            self.stdout.write(f'  {instruction}')
                    self.stdout.write('')
            except:
                pass
            
            sys.exit(1)

        if is_available:
            self.stdout.write(self.style.SUCCESS('✓ WeasyPrint is installed and working correctly'))
            self.stdout.write('')
            self.stdout.write('PDF export functionality is available.')
            self.stdout.write('')
            sys.exit(0)
        else:
            self.stdout.write(self.style.ERROR('✗ WeasyPrint is not available'))
            self.stdout.write('')
            
            if error_message:
                self.stdout.write(self.style.WARNING('Error:'))
                self.stdout.write(f'  {error_message}')
                self.stdout.write('')

            # Get platform-specific instructions
            instructions = get_platform_specific_instructions()
            
            if instructions:
                self.stdout.write(self.style.WARNING(f'{instructions["title"]}:'))
                self.stdout.write('')
                
                if 'instructions' in instructions and instructions['instructions']:
                    for instruction in instructions['instructions']:
                        self.stdout.write(f'  {instruction}')
                    self.stdout.write('')
                
                if 'docs_url' in instructions and instructions['docs_url']:
                    self.stdout.write('For more information, visit:')
                    self.stdout.write(f'  {instructions["docs_url"]}')
                    self.stdout.write('')

            # Show installation script information
            system = platform.system().lower()
            self.stdout.write(self.style.WARNING('Quick Installation:'))
            self.stdout.write('')
            
            if system == 'windows':
                self.stdout.write('  Run the installation script:')
                self.stdout.write('    .\\install_weasyprint_windows.ps1')
                self.stdout.write('')
                self.stdout.write('  Or install manually:')
                self.stdout.write('    pip install weasyprint[windows]')
            elif system == 'linux' or system == 'darwin':
                self.stdout.write('  Run the installation script:')
                self.stdout.write('    ./install_weasyprint.sh')
                self.stdout.write('')
                self.stdout.write('  Or install manually:')
                if system == 'linux':
                    self.stdout.write('    sudo apt-get install python3-cffi python3-brotli libpango-1.0-0 libpangoft2-1.0-0')
                    self.stdout.write('    pip install weasyprint')
                else:  # macOS
                    self.stdout.write('    brew install cairo pango gdk-pixbuf libffi')
                    self.stdout.write('    pip install weasyprint')
            
            self.stdout.write('')
            self.stdout.write(self.style.WARNING('Note:'))
            self.stdout.write('  - HTML export works without WeasyPrint')
            self.stdout.write('  - PDF export requires WeasyPrint and system dependencies')
            self.stdout.write('  - After installation, restart the Django server')
            self.stdout.write('')
            
            if options['verbose'] and error_type:
                self.stdout.write(self.style.WARNING('Error Type:'))
                self.stdout.write(f'  {error_type}')
                self.stdout.write('')

            sys.exit(1)

