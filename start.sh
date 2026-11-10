#!/bin/sh
# App Engine runs this every time it starts the app (it is the entrypoint in
# app.yaml). Same jobs the container_commands in .ebextensions did on Elastic
# Beanstalk in class: update the database tables, make sure there is an admin
# account, then start the web server.

# Creates or updates the tables in Cloud SQL. On a brand new database this
# also loads the starting project and blog post (portfolio/migrations/0002).
python3 manage.py migrate --noinput

# Uses the DJANGO_SUPERUSER_ values from app.yaml. After the first start the
# user is already there, so this prints an error and the script carries on.
python3 manage.py createsuperuser --noinput || echo "Admin user already exists, carrying on"

# Start the website. App Engine tells us which port to use in $PORT.
exec gunicorn -b :$PORT calkindev.wsgi
