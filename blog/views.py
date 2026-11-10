"""
Blog views, a list of posts and a page for each one. Both only use
published posts, so a draft can be written in the admin without it
showing up on the site.
"""
from django.views.generic import DetailView, ListView

from .models import Post


class PostListView(ListView):
    model = Post
    template_name = 'blog/post_list.html'
    context_object_name = 'posts'
    paginate_by = 10

    def get_queryset(self):
        return Post.objects.filter(published=True)


class PostDetailView(DetailView):
    model = Post
    template_name = 'blog/post_detail.html'
    context_object_name = 'post'

    def get_queryset(self):
        # Looking the slug up in published posts only means a draft gives a
        # 404, even if somebody guesses its address
        return Post.objects.filter(published=True)
