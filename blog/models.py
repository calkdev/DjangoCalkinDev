"""
A single Post model for the blog. On the old site each post was a markdown
file turned into a page by a build script, here they are written in the admin.
"""
from datetime import date

import markdown
from django.db import models
from django.urls import reverse


class Post(models.Model):
    title = models.CharField(max_length=200)
    # The part of the address after /blog/, e.g. /blog/rebuilding-calkindev-nz/
    slug = models.SlugField(max_length=200, unique=True)
    body = models.TextField(help_text='Written in Markdown.')
    published = models.BooleanField(default=False)
    published_date = models.DateField(default=date.today)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Newest posts first
        ordering = ['-published_date']

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('blog:post_detail', kwargs={'slug': self.slug})

    @property
    def body_html(self):
        # Turns the Markdown in body into HTML for post_detail.html
        return markdown.markdown(self.body, extensions=['fenced_code'])
