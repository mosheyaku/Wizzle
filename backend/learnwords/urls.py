from django.urls import path
from .views import SavedWordCreateView

urlpatterns = [
    path('save/', SavedWordCreateView.as_view(), name='save_word'),
]
