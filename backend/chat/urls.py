from django.contrib import admin
from django.urls import path, include
from chatapi.api import ConversationCreator

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('rest_framework.urls')),
    path('api/user/', include('user.urls')),
    path('api/conversation/<user_id>/', ConversationCreator.as_view(), name="conv_creator"),
]
