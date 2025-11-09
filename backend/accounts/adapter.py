from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    """
    Custom account adapter for django-allauth
    """
    def is_open_for_signup(self, request):
        """
        Allow signups
        """
        return True

    def get_login_redirect_url(self, request):
        """
        Redirect after login
        """
        return settings.LOGIN_REDIRECT_URL

