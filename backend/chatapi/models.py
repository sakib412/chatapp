from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Conversation(models.Model):
    initiator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='conv_starter')
    receiver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='conv_participant')
    last_msg = models.ForeignKey(
        'Message', on_delete=models.SET_NULL, null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)


class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    conv_id = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    is_read = models.BooleanField(default=False)
    archived = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp',]


    def __str__(self):
        return self.text
