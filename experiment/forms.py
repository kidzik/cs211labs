from django.db import models
from django.forms import ModelForm
from django import forms
from experiment.models import *

DEVICE_CHOICES = (
    ('LT', 'Laptop with a touchpad'),
    ('LM', 'Laptop with a mouse'),
    ('T', 'Tablet'),
    ('P', 'Phone'),
)

class UserForm(ModelForm):
    device = forms.ChoiceField(choices=DEVICE_CHOICES)

    class Meta:
        model = User
        fields = ['session', 'device']

    # Choose only open session
    def __init__(self, *args, **kwargs):
        super(UserForm, self).__init__(*args, **kwargs)
        self.fields['session'].queryset = self.fields['session'].queryset.exclude(closed=True)

class SessionForm(ModelForm):
    class Meta:
        model = Session
        fields = ['experiment', 'course']
