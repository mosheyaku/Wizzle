from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
import fitz

from .models import UploadedPDF
from .serializers import UploadedPDFSerializer

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
                words_data = [{"word": w[4], "x0": w[0], "y0": w[1], "x1": w[2], "y1": w[3]} for w in words]
                pages.append(words_data)

            return Response({"pages": pages})

        except UploadedPDF.DoesNotExist:
            return Response({"error": "PDF not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
