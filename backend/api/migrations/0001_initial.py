# Generated by Django 5.1.5 on 2025-02-04 16:44

import django.contrib.auth.models
import django.contrib.auth.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='BonSortie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('numero', models.CharField(blank=True, max_length=50, unique=True)),
                ('destination', models.CharField(default='Infirmerie', max_length=255)),
                ('date_sortie', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Commande',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fournisseur', models.CharField(default='Ministère', max_length=255)),
                ('date_reception', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Patient',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=255)),
                ('prenom', models.CharField(max_length=255)),
                ('age', models.PositiveIntegerField()),
                ('section', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='ProduitPharmaceutique',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nom', models.CharField(max_length=255, unique=True)),
                ('numero_lot', models.CharField(blank=True, max_length=100, null=True, unique=True)),
                ('quantite_en_stock', models.PositiveIntegerField(default=0)),
                ('unite', models.CharField(choices=[('carton', 'Carton'), ('plaquette', 'Plaquette')], default='plaquette', max_length=10)),
                ('quantite_par_carton', models.PositiveIntegerField(default=1)),
                ('date_peremption', models.DateField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Consultation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('maladie', models.CharField(max_length=255)),
                ('diagnostic', models.TextField(blank=True, null=True)),
                ('date_consultation', models.DateTimeField(auto_now_add=True)),
                ('docteur', models.ForeignKey(limit_choices_to={'role__in': ['docteur', 'infirmier']}, on_delete=django.db.models.deletion.CASCADE, related_name='consultations_realisees', to=settings.AUTH_USER_MODEL)),
                ('patient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='consultations', to='api.patient')),
            ],
        ),
        migrations.CreateModel(
            name='Prescription',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite_prescrite', models.PositiveIntegerField()),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('consultation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='prescriptions', to='api.consultation')),
                ('produit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.produitpharmaceutique')),
            ],
        ),
        migrations.AddField(
            model_name='consultation',
            name='produits_prescrits',
            field=models.ManyToManyField(related_name='consultations', through='api.Prescription', to='api.produitpharmaceutique'),
        ),
        migrations.CreateModel(
            name='CommandeProduit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite', models.PositiveIntegerField()),
                ('commande', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='produits_commandes', to='api.commande')),
                ('produit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commandes', to='api.produitpharmaceutique')),
            ],
        ),
        migrations.CreateModel(
            name='BonSortieProduit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite', models.PositiveIntegerField()),
                ('bon_sortie', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='produits', to='api.bonsortie')),
                ('produit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bons_sortie', to='api.produitpharmaceutique')),
            ],
        ),
        migrations.CreateModel(
            name='Alert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_alert', models.CharField(choices=[('stock_critique', 'Stock critique'), ('peremption', 'Produit proche de la péremption'), ('rupture', 'Rupture de stock')], max_length=50)),
                ('message', models.TextField()),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('statut', models.BooleanField(default=False)),
                ('utilisateur', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to=settings.AUTH_USER_MODEL)),
                ('produit', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to='api.produitpharmaceutique')),
            ],
        ),
        migrations.CreateModel(
            name='Rapport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('type_rapport', models.CharField(choices=[('stock', 'Rapport de Stock'), ('consultation', 'Rapport de Consultation'), ('bon_sortie', 'Rapport de Bon de Sortie')], max_length=50)),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('contenu', models.TextField(help_text='Détails ou description du rapport.')),
                ('utilisateur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='rapports', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='StockInfirmerie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantite_disponible', models.IntegerField(default=0)),
                ('produit', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='api.produitpharmaceutique')),
            ],
        ),
        migrations.CreateModel(
            name='Utilisateur',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('email', models.EmailField(blank=True, max_length=254, verbose_name='email address')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('role', models.CharField(choices=[('admin', 'Administrateur'), ('magasinier', 'Magasinier'), ('docteur', 'Docteur'), ('infirmier', 'Infirmier')], max_length=20)),
                ('groups', models.ManyToManyField(blank=True, related_name='custom_user_groups', to='auth.group')),
                ('user_permissions', models.ManyToManyField(blank=True, related_name='custom_user_permissions', to='auth.permission')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'abstract': False,
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
    ]
