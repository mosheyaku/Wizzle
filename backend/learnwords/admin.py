from django.contrib import admin
from .models import SavedWord


@admin.register(SavedWord)
class SavedWordAdmin(admin.ModelAdmin):
    list_display = ('word', 'translation', 'user', 'saved_at')
    search_fields = ('word', 'translation', 'user__email')
    list_filter = ('saved_at',)
