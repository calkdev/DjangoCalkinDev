"""
Views for the portfolio app.

    home              -> the one long home page, with the contact form at the bottom
    ProjectListView   -> a page listing every project
"""
from django.contrib import messages
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.generic import ListView

from blog.models import Post

from .forms import ContactForm
from .models import Project


def home(request):
    if request.method == 'POST':
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Message sent, thanks. I'll get back to you soon.")
            # Back down to the contact section, where the message is shown
            return redirect(reverse('portfolio:home') + '#contact')
    else:
        form = ContactForm()

    context = {
        'form': form,
        'projects': Project.objects.all()[:4],
        'posts': Post.objects.filter(published=True)[:3],
    }
    return render(request, 'portfolio/home.html', context)


class ProjectListView(ListView):
    model = Project
    template_name = 'portfolio/project_list.html'
    context_object_name = 'projects'
