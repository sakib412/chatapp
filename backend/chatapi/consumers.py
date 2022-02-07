import json
from asgiref.sync import async_to_sync
from django.db.models import Q
from django.contrib.auth import get_user_model
from channels.generic.websocket import WebsocketConsumer
from channels.layers import get_channel_layer

from chatapi.models import Conversation, Message
from .serializers import MessageSerializer, ConversationSerializer
from user.serializers import UserSerializer

User = get_user_model()

# self.conversation = Conversation.objects.filter(
#             Q(initiator=self.user, receiver=self.reciverUser) |
#             Q(initiator=self.reciverUser, receiver=self.user)
#         ).first()


def time_sort(val):
    timestamp = ""
    conv = dict(val)['conversation']
    if conv:
        last_msg = conv['last_msg']
        if "timestamp" in last_msg:
            timestamp = last_msg['timestamp']
    return timestamp


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        self.user = self.scope["user"]

        # Check user is authenticated
        if self.user.is_anonymous:
            self.accept()
            self.send(text_data=json.dumps({
                "message": "Please login first",
                "type": "error"
            }))
            self.close()

        self.conversation = Conversation.objects.filter(
            id=int(self.room_name)).first()
        if self.conversation is None:
            self.accept()
            self.send(text_data=json.dumps({
                "message": "Failed to join",
                "type": "error"
            }))
            self.close()

        self.reciverUser = self.conversation.receiver

        # if reciever id is not found
        if self.reciverUser is None:
            self.accept()
            self.send(text_data=json.dumps({
                "results": "Receiver not found"
            }))
            self.close()


        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        # connection accepted
        self.accept()

        messages = Message.objects.filter(
            conv_id=self.conversation).order_by("id")

        unread_messages = messages.exclude(
            sender=self.user).update(is_read=True)

        msgSerializerData = MessageSerializer(
            instance=messages, many=True).data

        self.send(text_data=json.dumps(
            {"results": msgSerializerData, "type": "all"}))



        # Send to global chat
        conv_serializer_global = ConversationSerializer(
            instance=self.conversation).data
        all_unread = Message.objects.filter(
            conv_id=self.conversation, is_read=False)
        all_unread_count = all_unread.count()
        initiator_unread = all_unread.filter(sender=self.conversation.initiator).count()
        receiver_unread = all_unread_count - initiator_unread


        conv_serializer_global.update({"unread": {
            'initiator': {'id':self.conversation.initiator.id, 'count': initiator_unread},
            'receiver': {'id':self.conversation.receiver.id, 'count': receiver_unread}
        }})

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            'global_chat',
            {
                "type": 'chat_message',
                'message': conv_serializer_global,
                'msg_type': 'update',
                'sender_channel_name': self.channel_name
            }
        )

    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        msg_type = text_data_json['type']
        if msg_type == 'new':
            text = text_data_json['message']
            message = Message.objects.create(
                sender=self.user, text=text, conv_id=self.conversation)
            self.conversation.last_msg = message
            self.conversation.save()
        if msg_type == 'delete':
            message = Message.objects.filter(
                id=int(text_data_json['messageID'])).first()
            message.archived = True
            if self.conversation.last_msg == message:
                self.conversation.last_msg = message
                self.conversation.save()
            message.save()

        if msg_type == 'read':
            message = Message.objects.filter(
                id=int(text_data_json['messageID'])
            ).first()
            if message.conv_id.id == text_data_json['conv_id']:
                message.is_read = True
                self.conversation.last_msg = message
                message.save()
                

        msgData = MessageSerializer(instance=message).data

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': msgData,
                'msg_type': msg_type
            }
        )

        # Send to global chat
        conv_serializer_global = ConversationSerializer(
            instance=self.conversation).data
        all_unread = Message.objects.filter(
            conv_id=self.conversation, is_read=False)
        all_unread_count = all_unread.count()
        initiator_unread = all_unread.filter(sender=self.conversation.initiator).count()
        receiver_unread = all_unread_count - initiator_unread


        conv_serializer_global.update({"unread": {
            'initiator': {'id':self.conversation.initiator.id, 'count': initiator_unread},
            'receiver': {'id':self.conversation.receiver.id, 'count': receiver_unread}
        }})

        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            'global_chat',
            {
                "type": 'chat_message',
                'message': conv_serializer_global,
                'msg_type': 'update',
                'sender_channel_name': self.channel_name
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        msg_type = event['msg_type']
        if msg_type == 'new':
            t = 'individual'
        else:
            t = msg_type

        
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'results': message,
            "type": t
        }))


class ConversationConsumer(WebsocketConsumer):
    def connect(self):
        self.online_users = {}

        self.user = self.scope["user"]

        # Check user is authenticated
        if self.user.is_anonymous:
            self.accept()
            self.send(text_data=json.dumps({
                "type": "error",
                "message": "Please login first"
            }))
            self.close()
        self.room_group_name = "global_chat"

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()
        #
        if str(self.user.id) in self.online_users:
            self.online_users[str(self.user.id)] += 1
        else:
            self.online_users[str(self.user.id)] = 1

        all_users = User.objects.exclude(id=self.user.id)
        user_serialized_data = UserSerializer(
            instance=all_users, many=True, context={"user": self.user}).data

        sorted_data = sorted(user_serialized_data, key=time_sort, reverse=True)

        self.send(text_data=json.dumps({
            "results": sorted_data,
            "type": "all"
        }))

    def disconnect(self, code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )

        if str(self.user.id) in self.online_users:
            self.online_users[str(self.user.id)] -= 1
        else:
            self.online_users[str(self.user.id)] = 0

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        text = text_data_json['message']
        msg_type = text_data_json['type']

        # Send message to room group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': text,
                "msg_type": msg_type,
            }
        )

    # Receive message from room group
    def chat_message(self, event):
        message = event['message']
        msg_type = event['msg_type']


        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'result': message,
            "type": msg_type
        }))
