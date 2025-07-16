# Use official Python base image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project files
COPY . .

# Expose port (optional, default for Django dev server)
EXPOSE 8000

# Run migrations and then start the Django dev server
CMD python manage.py migrate && python manage.py runserver 0.0.0.0:8000
