from django.urls import path
from .views import SaveWordView

urlpatterns = [
    path('save/', SaveWordView.as_view(), name='save_word'),
]
