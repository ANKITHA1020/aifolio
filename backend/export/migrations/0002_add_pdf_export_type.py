# Generated migration to add 'pdf' export type

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('export', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='exportjob',
            name='export_type',
            field=models.CharField(
                choices=[
                    ('html', 'HTML/CSS/JS'),
                    ('pdf', 'PDF Document'),
                    ('zip', 'ZIP Package'),
                    ('github', 'GitHub Pages')
                ],
                default='html',
                max_length=20
            ),
        ),
    ]

