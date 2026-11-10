"""
Loads the starting content (the OurRoom project and the first blog post from
the old calkindev.nz) from portfolio/fixtures/sample_content.json.

It is a migration rather than a step to remember, so it runs once on every
new database, locally and on Cloud SQL, when `migrate` runs. Django records
that it has run, so it never puts the content back after it has been edited
in the admin.
"""
from django.core.management import call_command
from django.db import migrations


def load_sample_content(apps, schema_editor):
    call_command('loaddata', 'sample_content')


class Migration(migrations.Migration):

    dependencies = [
        ('portfolio', '0001_initial'),
        ('blog', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_sample_content, migrations.RunPython.noop),
    ]
