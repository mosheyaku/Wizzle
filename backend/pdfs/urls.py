from django.urls import path
from .views import PDFTextExtractView, PDFUploadView

urlpatterns = [
    path('upload/', PDFUploadView.as_view(), name='upload-pdf'),
    path('<int:pk>/extract/', PDFTextExtractView.as_view(), name='extract-text'),

]
