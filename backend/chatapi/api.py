from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import views, permissions, status
from rest_framework.response import Response
from chatapi.models import Conversation
from chatapi.serializers import ConversationSerializer

User = get_user_model()


class ConversationCreator(views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request, *args, **kwargs):
        receiverID = kwargs.get("user_id", None)
        receiver = User.objects.filter(id=int(receiverID)).first()
        if receiver is None:
            return Response({"message": "Please input correct receiver ID"}, status=status.HTTP_400_BAD_REQUEST)

        conversation = Conversation.objects.filter(
            Q(initiator=request.user, receiver=receiver) |
            Q(initiator=receiver, receiver=request.user)
        ).first()
        if conversation:
            pass
        else:
            conversation = Conversation.objects.create(
                initiator=request.user, receiver=receiver)

        if conversation:
            serializer_data = ConversationSerializer(
                instance=conversation).data

            return Response({
                "results": serializer_data
            })
        else:
            return Response(
                {"message": "Something went wrong, please try again"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
