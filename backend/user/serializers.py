from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import serializers
from chatapi.serializers import ConversationSerializer
from chatapi.models import Conversation, Message


User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name',
                  'last_name', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def to_representation(self, instance):
        data = super().to_representation(instance)

        user = self.context.get("user")
        if user:
            conversation = Conversation.objects.filter(
                Q(initiator=instance, receiver=user) |
                Q(initiator=user, receiver=instance)
            ).first()

            if conversation:

                conv_serializer_data = ConversationSerializer(
                    instance=conversation).data

                all_unread = Message.objects.filter(
                    conv_id=conversation, is_read=False)
                all_unread_count = all_unread.count()
                initiator_unread = all_unread.filter(
                    sender=conversation.initiator).count()
                receiver_unread = all_unread_count - initiator_unread

                conv_serializer_data.update({"unread": {
                    'initiator': {'id': conversation.initiator.id, 'count': initiator_unread},
                    'receiver': {'id': conversation.receiver.id, 'count': receiver_unread}
                }})
            else:
                conv_serializer_data = None

            data.update({"conversation": conv_serializer_data})

        return data
