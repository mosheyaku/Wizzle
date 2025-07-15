from django.urls import path
from .views import Login, Signup

urlpatterns = [
    path('register/', Signup.as_view(), name='register'),
    path('me/', Login.as_view(), name='login'), 
]
