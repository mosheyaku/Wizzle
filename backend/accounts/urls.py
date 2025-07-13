from django.urls import path
from .views import CurrentUser, Signup

urlpatterns = [
    path('register/', Signup.as_view(), name='register'),
    path('me/', CurrentUser.as_view(), name='current-user'), 
]
