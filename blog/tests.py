from django.test import TestCase
from django.urls import reverse

from .models import Post


class BlogTests(TestCase):

    def setUp(self):
        self.published_post = Post.objects.create(
            title='Published Post', slug='published-post',
            body='Hello', published=True,
        )
        self.draft_post = Post.objects.create(
            title='Draft Post', slug='draft-post',
            body='Not finished', published=False,
        )

    def test_blog_list_only_shows_published_posts(self):
        response = self.client.get(reverse('blog:post_list'))
        self.assertContains(response, 'Published Post')
        self.assertNotContains(response, 'Draft Post')

    def test_published_post_page_loads(self):
        response = self.client.get(self.published_post.get_absolute_url())
        self.assertEqual(response.status_code, 200)

    def test_draft_post_gives_404(self):
        response = self.client.get(reverse('blog:post_detail', kwargs={'slug': 'draft-post'}))
        self.assertEqual(response.status_code, 404)
