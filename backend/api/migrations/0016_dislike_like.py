# Generated by Django 5.1.2 on 2024-11-17 02:58

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_alter_item_winning_bid'),
    ]

    operations = [
        migrations.CreateModel(
            name='Dislike',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dislikes', to='api.comment')),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dislikes', to='api.profile')),
            ],
        ),
        migrations.CreateModel(
            name='Like',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='api.comment')),
                ('profile', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='likes', to='api.profile')),
            ],
        ),
    ]
