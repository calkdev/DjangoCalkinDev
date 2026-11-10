from django.test import TestCase
from django.urls import reverse

from .models import ContactMessage, Project


class HomePageTests(TestCase):

    def test_home_page_loads(self):
        response = self.client.get(reverse('portfolio:home'))
        self.assertEqual(response.status_code, 200)

    def test_contact_form_saves_the_message(self):
        response = self.client.post(reverse('portfolio:home'), {
            'name': 'Test User',
            'email': 'test@example.com',
            'subject': 'Hello',
            'message': 'Just testing the contact form.',
        })
        # A valid form redirects back to the home page
        self.assertEqual(response.status_code, 302)
        self.assertEqual(ContactMessage.objects.count(), 1)

    def test_contact_form_needs_an_email(self):
        response = self.client.post(reverse('portfolio:home'), {
            'name': 'Test User',
            'email': '',
            'message': 'No email address given.',
        })
        # An invalid form shows the page again with the errors, nothing saved
        self.assertEqual(response.status_code, 200)
        self.assertEqual(ContactMessage.objects.count(), 0)


class ProjectListTests(TestCase):

    def test_projects_page_shows_projects(self):
        Project.objects.create(title='Test Project', summary='A project made in a test.')
        response = self.client.get(reverse('portfolio:project_list'))
        self.assertContains(response, 'Test Project')
