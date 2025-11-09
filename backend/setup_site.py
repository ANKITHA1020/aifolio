import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolioai_backend.settings')
django.setup()

from django.contrib.sites.models import Site

site, created = Site.objects.get_or_create(pk=1)
site.domain = 'localhost:8000'
site.name = 'PortfolioAI'
site.save()

print(f"Site {'created' if created else 'updated'} successfully!")
print(f"Domain: {site.domain}")
print(f"Name: {site.name}")

