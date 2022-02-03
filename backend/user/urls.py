from django.urls import path, include
from rest_framework import routers
from .api import UserViewSet, LoginView,UserView



router = routers.DefaultRouter()
router.register('', UserViewSet)

urlpatterns = [
    path('login/',LoginView.as_view(), name="login" ),
    path('me/',UserView.as_view(), name="owner"),
    path('', include(router.urls)),
]