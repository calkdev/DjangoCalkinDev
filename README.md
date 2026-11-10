# CalkinDev, Django rewrite

CS204B Cloud Application Development, Assessment 1, Scenario 5 (own project).

A simple rewrite of my portfolio site, calkindev.nz, from a static
Vite/TypeScript/Bulma site into a Django 5.2 project, deployed on Google Cloud
(App Engine with a Cloud SQL PostgreSQL database).

The original site is kept in `_original_vite/` for comparison.


## What's in it

- **`portfolio` app**: the home page (hero, about, projects, latest blog posts
  and the contact form), plus a page listing every project. Projects and contact
  messages are stored in the database.
- **`blog` app**: blog posts written in Markdown, a list page and a page for each
  post. Posts that aren't ticked as published stay hidden.
- **Django admin** at `/admin/`: add and edit projects and posts, and read the
  messages people send through the contact form.

The About section (profile, skills, timeline) is plain HTML in `home.html`, the
same as the old site, since it hardly ever changes. The stylesheet is the old
site's Bulma + SCSS, compiled into `static/css/site.css`, so the site looks the
same as before.


## Project layout

```
CS204B_Assessment/
    manage.py            Django's command line tool
    requirements.txt     Python packages needed to run the site
    calkindev/           Project settings, root urls.py, wsgi/asgi
    portfolio/           Home page, projects, contact form
        fixtures/        The starting projects and blog post
    blog/                Blog posts
    templates/           base.html and 404.html, shared by every page
    static/              CSS, JS and images, served at /static/
    app.yaml.example     App Engine settings, copy to app.yaml before deploying
    start.sh             What App Engine runs when it starts the site
    .gcloudignore        Files that don't get uploaded to App Engine
    src/styles/          The SCSS the stylesheet is built from
    _original_vite/      The old site, for the before/after comparison
```


## Running it locally

These steps are for a Mac with PostgreSQL installed through Homebrew. On
Windows the commands are the same apart from activating the virtual
environment (`venv\Scripts\activate.bat`) and creating the database in pgAdmin.

### 1. Create the database

Make sure PostgreSQL 16 or 17 is running, then:

```bash
createdb calkindev_db
```

The local database details are in the `else:` part of the Database section
in `calkindev/settings.py` (user `postgres`, no password). Change them there if
yours are different.

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Create the tables

```bash
python manage.py migrate
```

This also loads the starting content (a project and the first blog post)
from `portfolio/fixtures/sample_content.json`. That happens in the migration
`portfolio/migrations/0002_load_sample_content.py`, so it only ever runs once
on each database.

### 4. Create an admin account

```bash
python manage.py createsuperuser
```

### 5. Run the site

```bash
python manage.py runserver 8002
```

- <http://localhost:8002/> for the site
- <http://localhost:8002/projects/> for every project
- <http://localhost:8002/blog/> for the blog
- <http://localhost:8002/admin/> to manage the content

### Had the older version of this project set up?

The database tables changed in this rewrite, so start the local database again
from empty (this deletes the old local data):

```bash
dropdb calkindev_db
createdb calkindev_db
python manage.py migrate
python manage.py createsuperuser
```


## Running the tests

```bash
python manage.py test
```

Django makes its own test database for this and deletes it afterwards, so it
never touches `calkindev_db`.


## Deploying to Google Cloud

The site runs on **Google App Engine** (standard environment, Python 3.13),
which is Google's version of Elastic Beanstalk: you give it the code and it
runs it. The data is in **Cloud SQL for PostgreSQL 17**. Both are in the
Sydney region, `australia-southeast1`, the closest to New Zealand.

How the pieces fit together:

- **`calkindev/settings.py`** checks for the `GAE_APPLICATION` environment
  variable, which App Engine sets and a laptop never has. When it's there, debug
  is off, the secret key and database details come from environment variables,
  and the database is reached through Cloud SQL's socket at
  `/cloudsql/<connection name>`.
- **`app.yaml`** (copied from `app.yaml.example`) tells App Engine which Python
  version to use, sets those environment variables, serves `staticfiles/` at
  `/static/` and sends every http visitor to https. It has the real passwords in
  it, so it's in `.gitignore` and never goes on GitHub.
- **`start.sh`** runs every time App Engine starts the site: it runs `migrate`,
  creates the admin account from the `DJANGO_SUPERUSER_` values in `app.yaml` the
  first time, then starts gunicorn.

### Steps

Everything below is done in the Google Cloud Console and in **Cloud Shell**, the
terminal that opens inside the console, so nothing has to be installed locally.

1. Create a Google Cloud project and start the free trial. In Cloud Shell, turn
   on the APIs the site needs:

   ```bash
   gcloud services enable appengine.googleapis.com sqladmin.googleapis.com cloudbuild.googleapis.com
   ```

2. In **SQL**, create a PostgreSQL instance:
   - Instance ID `calkindev-db`
   - **Enterprise** edition, **PostgreSQL 17**
   - region `australia-southeast1`, single zone
   - shared core machine

   Then add a database called `calkindev` and a user called `calkindev`. Copy
   the **Connection name** from the instance's Overview page.

3. In **App Engine**, create an application in `australia-southeast1`, or in
   Cloud Shell:

   ```bash
   gcloud app create --region=australia-southeast1
   ```

4. In Cloud Shell, get the code and get it ready:

   ```bash
   git clone <your GitHub repo URL> calkindev
   cd calkindev
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   python manage.py collectstatic --noinput
   cp app.yaml.example app.yaml
   ```

   Open `app.yaml` (`cloudshell edit app.yaml`) and fill in every `<...>` value.
   This makes a new secret key:

   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

5. Deploy, then open the site:

   ```bash
   gcloud app deploy
   gcloud app browse
   ```

The first time it starts, `start.sh` creates the tables in Cloud SQL, loads the
starting content and creates the admin account, so the first page can take a
little longer than usual to load.

### Deploying again after a change

```bash
cd ~/calkindev
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput
gcloud app deploy
```

`app.yaml` stays in the Cloud Shell folder between deploys, it isn't in git.

### Cost

- App Engine `F1` instances have a free allowance of 28 instance hours a day,
  and `app.yaml` limits the site to one instance, so that part is free.
- Cloud SQL isn't free, but the smallest shared core instance costs roughly
  US$10 a month, which comes out of the free trial credit.
- Turn everything off after marking, either by stopping the Cloud SQL instance
  or by shutting the whole project down.


## Rebuilding the stylesheet

The CSS is compiled from `src/styles/` and committed, so Node isn't needed to
run or deploy the site, only to change the styles. Bulma has to be installed
first because the SCSS imports it:

```bash
npm install --no-save sass bulma@1
npx sass --load-path=node_modules --style=compressed --no-source-map \
  src/styles/site.scss static/css/site.css
```
