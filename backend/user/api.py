from django.contrib.auth import get_user_model, authenticate, login
from django.db import IntegrityError
from rest_framework import viewsets, mixins, views, permissions, status
from rest_framework.viewsets import GenericViewSet
from rest_framework.response import Response
from .serializers import UserSerializer
from .permissions import IsOwnerOrReadOnly


User = get_user_model()


class UserViewSet(
        mixins.CreateModelMixin,
        mixins.RetrieveModelMixin,
        mixins.ListModelMixin,
        GenericViewSet):
    '''Delete and Update deny'''
    permission_classes = [IsOwnerOrReadOnly, ]
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create(self, request):
        username = request.data.get("username", None)
        email = request.data.get("email", "")
        password = request.data.get("password", None)
        first_name = request.data.get("first_name", "")
        last_name = request.data.get("last_name", "")
        try:
            user = User.objects.create_user(username, email, password)
        except IntegrityError as e:
            return Response({"message": "try with another username"}, status=status.HTTP_409_CONFLICT)
        user.first_name = first_name
        user.last_name = last_name
        user.save()
        serializer_data = UserSerializer(user).data
        return Response(serializer_data)


class UserView(views.APIView):
    permission_classes = [permissions.IsAuthenticated, ]

    def get(self, request, *args, **kwargs):
        user = request.user
        serializer_data = UserSerializer(user).data
        return Response({"user": serializer_data})


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny, ]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username", None)
        password = request.data.get("password", None)
        if username is None or password is None:
            return Response({"message": "Please input username and password"}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
        else:
            return Response({"message": "wrong credentials"}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"message": "Login success"})
