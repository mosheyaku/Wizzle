from rest_framework import serializers
from .models import SavedWord

class SavedWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedWord
        fields = [
            'id',
            'word',
            'translation',
            'saved_at',
            'remembered_count',
            'last_reviewed_at',
            'next_review_at',
        ]
