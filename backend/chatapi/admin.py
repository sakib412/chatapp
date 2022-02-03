from django.contrib import admin
from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['last_msg', 'initiator', 'receiver', 'created_at']


@admin.register(Message)
class NameAdmin(admin.ModelAdmin):
    list_display = ['text', 'is_read', 'sender']
