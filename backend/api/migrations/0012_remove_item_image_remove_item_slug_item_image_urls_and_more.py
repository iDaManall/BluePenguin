# Generated by Django 5.1.2 on 2024-11-17 00:21

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_alter_profile_average_rating'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='image',
        ),
        migrations.RemoveField(
            model_name='item',
            name='slug',
        ),
        migrations.AddField(
            model_name='item',
            name='image_urls',
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.AlterField(
            model_name='account',
            name='balance',
            field=models.DecimalField(blank=True, decimal_places=2, default=0.0, max_digits=6, null=True),
        ),
        migrations.AlterField(
            model_name='account',
            name='card_details',
            field=models.OneToOneField(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.carddetails'),
        ),
        migrations.AlterField(
            model_name='account',
            name='paypal_details',
            field=models.OneToOneField(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.paypaldetails'),
        ),
        migrations.AlterField(
            model_name='account',
            name='shipping_address',
            field=models.ForeignKey(blank=True, default=None, null=True, on_delete=django.db.models.deletion.CASCADE, to='api.shippingaddress'),
        ),
        migrations.AlterField(
            model_name='profile',
            name='display_icon',
            field=models.URLField(blank=True, choices=[('https://storage.googleapis.com/blue_penguin/default/blue_blind.png', 'avatar1'), ('https://storage.googleapis.com/blue_penguin/default/blue_egg.png', 'avatar2'), ('https://storage.googleapis.com/blue_penguin/default/green_glasses.png', 'avatar3'), ('https://storage.googleapis.com/blue_penguin/default/green_hair.png', 'avatar4'), ('https://storage.googleapis.com/blue_penguin/default/purple_bandit.png', 'avatar5'), ('https://storage.googleapis.com/blue_penguin/default/purple_egg.png', 'avatar6'), ('https://storage.googleapis.com/blue_penguin/default/red_crown.png', 'avatar7'), ('https://storage.googleapis.com/blue_penguin/default/red_eyepatch.png', 'avatar8'), ('https://storage.googleapis.com/blue_penguin/default/yellow_glasses.png', 'avatar9'), ('https://storage.googleapis.com/blue_penguin/default/yellow_hair.png', 'avatar10')], default=None, max_length=255, null=True),
        ),
        migrations.AlterField(
            model_name='shippingaddress',
            name='state',
            field=models.TextField(blank=True, max_length=255),
        ),
    ]
