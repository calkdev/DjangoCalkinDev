"""
The contact form on the home page.
"""
from django import forms

from .models import ContactMessage


# A model form builds its fields from the ContactMessage model, so the
# max lengths and required fields only have to be written once (in models.py)
class ContactForm(forms.ModelForm):

    class Meta:
        model = ContactMessage
        fields = ('name', 'email', 'subject', 'message')
        # The class names are Bulma's, so the inputs look the same as the old site
        widgets = {
            'name': forms.TextInput(attrs={'class': 'input', 'placeholder': 'Your name'}),
            'email': forms.EmailInput(attrs={'class': 'input', 'placeholder': 'your.email@example.com'}),
            'subject': forms.TextInput(attrs={'class': 'input', 'placeholder': 'Brief subject line'}),
            'message': forms.Textarea(attrs={'class': 'textarea', 'placeholder': 'Your message...', 'rows': 5}),
        }
