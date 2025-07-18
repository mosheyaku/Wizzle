from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from .models import SavedWord
from .serializers import SavedWordSerializer
from django.db import models
from datetime import timedelta


class SavedWordCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        word = request.data.get('word', '').strip()
        translation = request.data.get('translation', '').strip()

        if not word:
            return Response({'error': 'Word is required'}, status=status.HTTP_400_BAD_REQUEST)

        obj, created = SavedWord.objects.get_or_create(
            user=user,
            word=word,
            defaults={'translation': translation}
        )

        if not created:
            return Response({'message': 'Word already saved'}, status=status.HTTP_200_OK)

        serializer = SavedWordSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SavedWordListView(generics.ListAPIView):
    serializer_class = SavedWordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        now = timezone.now()
        return SavedWord.objects.filter(
            user=self.request.user,
        ).filter(
            models.Q(next_review_at__lte=now) | models.Q(next_review_at__isnull=True)
        ).order_by('next_review_at', '-saved_at')


class ReviewStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        word_id = request.data.get('word_id')
        remembered = request.data.get('remembered')

        if word_id is None or remembered is None:
            return Response({'error': 'word_id and remembered required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            word = SavedWord.objects.get(id=word_id, user=request.user)
        except SavedWord.DoesNotExist:
            return Response({'error': 'Word not found'}, status=status.HTTP_404_NOT_FOUND)

        remembered = bool(remembered)

        word.update_review_schedule(remembered)

        if word.remembered_count >= 4 and remembered:
            return Response({'status': 'fully_learned', 'word_id': word.id})

        serializer = SavedWordSerializer(word)
        return Response(serializer.data)


class SavedWordDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SavedWordSerializer

    def get_queryset(self):
        return SavedWord.objects.filter(user=self.request.user)


class ResetLearningView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        word_id = request.data.get('word_id')
        if not word_id:
            return Response({'error': 'word_id required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            word = SavedWord.objects.get(id=word_id, user=request.user)
        except SavedWord.DoesNotExist:
            return Response({'error': 'Word not found'}, status=status.HTTP_404_NOT_FOUND)

        now = timezone.now()
        word.remembered_count = 0
        word.last_reviewed_at = now
        word.next_review_at = now + timedelta(days=1)
        word.save()

        serializer = SavedWordSerializer(word)
        return Response(serializer.data)


