from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('me/', views.current_user, name='current_user'),
    path('oauth/redirect/', views.oauth_redirect, name='oauth_redirect'),
    path('oauth/callback/', views.oauth_callback, name='oauth_callback'),
]

