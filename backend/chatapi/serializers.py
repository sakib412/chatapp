from rest_framework.serializers import ModelSerializer
from .models import Message, Conversation


class MessageSerializer(ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'text', 'is_read',
                  'archived', 'timestamp', 'conv_id']


class ConversationSerializer(ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "initiator", "receiver",
                  "last_msg", "created_at", "updated_at"]

    def to_representation(self, instance):
        data = super().to_representation(instance)

        data.update({"last_msg": MessageSerializer(
            instance=instance.last_msg).data})

        return data
