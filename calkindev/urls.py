"""
Root URL configuration.

    /            -> the portfolio home page (portfolio/urls.py)
    /projects/   -> every project
    /blog/       -> the blog list and each post (blog/urls.py)
    /admin/      -> Django's built in admin, where the projects and posts are managed
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('portfolio.urls')),
    path('blog/', include('blog.urls')),
]
