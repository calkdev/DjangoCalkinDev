"""
Models for the portfolio side of the site.

On the old calkindev.nz everything was hardcoded in index.html. Here the
projects live in the database so they can be added and edited in the admin,
and contact form messages get saved instead of being posted to another site.
The About section (profile, skills, timeline) stays as plain HTML in
home.html, it hardly ever changes so it does not need a model.
"""
from django.db import models


class Project(models.Model):

    class Status(models.TextChoices):
        LIVE = 'live', 'Live'
        IN_DEVELOPMENT = 'wip', 'In development'
        ARCHIVED = 'archived', 'Archived'

    title = models.CharField(max_length=120)
    # The small label above the title on the card, e.g. "Web ~ Realtime"
    category = models.CharField(max_length=60, blank=True)
    summary = models.TextField()
    tech_stack = models.CharField(
        max_length=200,
        blank=True,
        help_text='Separate with commas, e.g. Django, PostgreSQL, Docker',
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.IN_DEVELOPMENT,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Newest projects first
        ordering = ['-created_at']

    def __str__(self):
        return self.title

    def tech_list(self):
        # Splits "Django, PostgreSQL" into ['Django', 'PostgreSQL'] so the
        # template can show each one as its own tag
        return [tech.strip() for tech in self.tech_stack.split(',') if tech.strip()]


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.subject}'
