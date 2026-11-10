from django.contrib import admin

from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'published', 'published_date')
    list_filter = ('published',)
    search_fields = ('title', 'body')
    # Fills the slug in from the title while typing
    prepopulated_fields = {'slug': ('title',)}
