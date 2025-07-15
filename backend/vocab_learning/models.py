from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class SavedWord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_words')
    word = models.CharField(max_length=255)
    translation = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'word')

    def __str__(self):
        return f"{self.word} ({self.user.email})"
