from django.db import models

class UploadedPDF(models.Model):
    file = models.FileField(upload_to='pdfs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name


class TranslationCache(models.Model):
    word = models.CharField(max_length=255, unique=True)
    translated = models.TextField()

    def __str__(self):
        return f"{self.word} → {self.translated}"

