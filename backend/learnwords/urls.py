from django.urls import path
from .views import SavedWordCreateView, SavedWordListView, ReviewStatusUpdateView, SavedWordDeleteView, ResetLearningView

urlpatterns = [
    path('save/', SavedWordCreateView.as_view(), name='save_word'),
    path('mywords/', SavedWordListView.as_view(), name='list-saved-words'),
    path('saved-words/review/', ReviewStatusUpdateView.as_view(), name='saved-words-review'),  
    path('save/<int:pk>/', SavedWordDeleteView.as_view(), name='delete_saved_word'),
    path('reset_learning/', ResetLearningView.as_view(), name='reset_learning'),  

]

