from django.urls import path
from .views import SavedWordCreateView, SavedWordListView

urlpatterns = [
    path('save/', SavedWordCreateView.as_view(), name='save_word'),
    path('mywords/', SavedWordListView.as_view(), name='list-saved-words'),

]
