from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class SavedWord(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_words')
    word = models.CharField(max_length=255)
    translation = models.CharField(max_length=255, blank=True)
    saved_at = models.DateTimeField(auto_now_add=True)

    remembered_count = models.PositiveSmallIntegerField(default=0)
    last_reviewed_at = models.DateTimeField(null=True, blank=True)
    next_review_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'word')
        ordering = ['-saved_at']

    def __str__(self):
        return f"{self.word} ({self.user.email})"

    def update_review_schedule(self, remembered: bool):
        now = timezone.now()
        if remembered:
            self.remembered_count = min(self.remembered_count + 1, 4)
        else:
            self.remembered_count = 0

        self.last_reviewed_at = now

        if self.remembered_count == 1:
            self.next_review_at = now + timedelta(days=1)
        elif self.remembered_count == 2:
            self.next_review_at = now + timedelta(days=3)
        elif self.remembered_count == 3:
            self.next_review_at = now + timedelta(days=7)
        elif self.remembered_count >= 4:
            self.next_review_at = None
        else:
            self.next_review_at = now + timedelta(days=1)

        self.save()
