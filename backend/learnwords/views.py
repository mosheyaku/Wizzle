from rest_framework import generics, permissions
from .models import SavedWord
from .serializers import SavedWordSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

class SavedWordCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        word = request.data.get('word', '').strip()
        translation = request.data.get('translation', '').strip()

        if not word:
            return Response({'error': 'Word is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Create or get existing
        obj, created = SavedWord.objects.get_or_create(
            user=user,
            word=word,
            defaults={'translation': translation}
        )

        if not created:
            return Response({'message': 'Word already saved'}, status=status.HTTP_200_OK)

        serializer = SavedWordSerializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
