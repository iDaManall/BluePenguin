# Generated by Django 5.1.2 on 2024-11-14 23:04

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_rating_rating'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='date_posted',
            field=models.DateField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
