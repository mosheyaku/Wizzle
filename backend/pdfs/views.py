import traceback
import logging
import re
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import fitz  
import requests
from django.conf import settings

from .models import UploadedPDF, TranslationCache
from .serializers import UploadedPDFSerializer

logger = logging.getLogger(__name__)

AZURE_TRANSLATOR_KEY = settings.AZURE_TRANSLATOR_KEY
AZURE_TRANSLATOR_REGION = settings.AZURE_TRANSLATOR_REGION
AZURE_TRANSLATOR_URL = settings.AZURE_TRANSLATOR_URL


class PDFUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, *args, **kwargs):
        serializer = UploadedPDFSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PDFTextExtractView(APIView):
    def get(self, request, pk):
        try:
            pdf = UploadedPDF.objects.get(pk=pk)
            file_path = pdf.file.path

            doc = fitz.open(file_path)
            pages = []

            for page in doc:
                words = page.get_text("words")
                words_data = [
                    {
                        "word": w[4],
                        "x0": w[0],
                        "y0": w[1],
                        "x1": w[2],
                        "y1": w[3]
                    } for w in words
                ]
                pages.append(words_data)

            return Response({"pages": pages})

        except UploadedPDF.DoesNotExist:
            return Response({"error": "PDF not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error("Error extracting PDF text", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class TranslateWordView(APIView):
    def post(self, request, *args, **kwargs):
        raw_word = request.data.get('word')
        if not raw_word:
            return Response({'error': 'No word provided'}, status=status.HTTP_400_BAD_REQUEST)

        cleaned_word = re.sub(r'[^\w\d]', '', raw_word)
        if not cleaned_word:
            return Response({'error': 'Invalid word'}, status=status.HTTP_400_BAD_REQUEST)
        
        cached = TranslationCache.objects.filter(word__iexact=cleaned_word).first()
        if cached:
            return Response({'translated': cached.translated})

        headers = {
            'Ocp-Apim-Subscription-Key': AZURE_TRANSLATOR_KEY,
            'Ocp-Apim-Subscription-Region': AZURE_TRANSLATOR_REGION,
            'Content-type': 'application/json'
        }
        body = [{'Text': cleaned_word}]

        try:
            response = requests.post(AZURE_TRANSLATOR_URL, headers=headers, json=body)
            response.raise_for_status()
            translated = response.json()[0]['translations'][0]['text']

            TranslationCache.objects.create(word=cleaned_word, translated=translated)

            return Response({'translated': translated})

        except Exception as e:
            logger.error("Translation failed", exc_info=True)
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
