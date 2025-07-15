from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import SavedWord
from .serializers import SavedWordSerializer

class SaveWordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        word = request.data.get("word", "").strip()
        translation = request.data.get("translation", "").strip()

        if not word or not translation:
            return Response({"error": "Word and translation are required"}, status=400)

        saved_word, created = SavedWord.objects.get_or_create(
            user=request.user,
            word=word,
            defaults={'translation': translation}
        )
        if not created:
            return Response({"message": "Word already saved."}, status=200)

        return Response(SavedWordSerializer(saved_word).data, status=201)
