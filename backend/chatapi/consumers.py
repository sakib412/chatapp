import json
from asgiref.sync import async_to_sync
from django.db.models import Q
from django.contrib.auth import get_user_model
from channels.generic.websocket import WebsocketConsumer
from chatapi.models import Conversation, Message
from .serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        self.user = self.scope["user"]
        self.reciverUser = User.objects.filter(username=self.room_name).first()
        # Check user is authenticated
        if self.user.is_anonymous:
            self.accept()
            self.send(text_data=json.dumps({
                "message": "Please login first"
            }))
            self.close()

        # if reciever id is not found
        if self.reciverUser is None:
            self.accept()
            self.send(text_data=json.dumps({
                "results": "Please login first"
            }))
            self.close()

        print(self.user)
        if self.user.username == self.room_name:
            self.accept()
            self.send(text_data=json.dumps({
                "message": "You cannot send message yourself"
            }))
            self.close()

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        # connection accepted
        self.accept()

        self.conversation = Conversation.objects.filter(
            Q(initiator=self.user, receiver=self.reciverUser) |
            Q(initiator=self.reciverUser, receiver=self.user)
        ).first()
        print(self.conversation)
        messages = Message.objects.filter(conv_id=self.conversation)[:100]

        msgSerializerData = MessageSerializer(
            instance=messages, many=True).data

        self.send(text_data=json.dumps({"results": msgSerializerData}))

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        text = text_data_json['message']

        message = Message.objects.create(sender=self.user,text=text,conv_id=self.conversation)
        msgData = MessageSerializer(instance=message).data



        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': msgData
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'results': message
        }))
