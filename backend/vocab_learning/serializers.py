from rest_framework import serializers
from .models import SavedWord

class SavedWordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedWord
        fields = ['id', 'word', 'translation', 'created_at']
