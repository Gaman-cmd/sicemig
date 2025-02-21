#models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils.timezone import now
from django.core.exceptions import ValidationError
from django.db.models.signals import post_save
from django.dispatch import receiver
# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.conf import settings  # Pour accéder au modèle utilisateur personnalisé
# Modèle personnalisé pour les utilisateurs
class Utilisateur(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrateur'),
        ('magasinier', 'Magasinier'),
        ('docteur', 'Docteur'),
        ('infirmier', 'Infirmier'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    # Spécifiez des related_name uniques pour éviter les conflits
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups',
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


# Modèle pour les produits pharmaceutiques

from django.db import models

class ProduitPharmaceutique(models.Model):
    UNITE_CHOICES = [
        ('carton', 'Carton'),
        ('plaquette', 'Plaquette'),
    ]

    nom = models.CharField(max_length=255, unique=True)  # Nom unique du produit
    numero_lot = models.CharField(max_length=100, unique=True, blank=True, null=True)  # Numéro de lot (optionnel)
    quantite_en_stock = models.PositiveIntegerField(default=0)  # Stock total (initialement 0)
    unite = models.CharField(max_length=10, choices=UNITE_CHOICES, default='plaquette')  # Unité du produit
    quantite_par_carton = models.PositiveIntegerField(default=1)  # Nombre de plaquettes par carton
    date_peremption = models.DateField(null=True, blank=True)  # Date de péremption

    def quantite_totale_plaquettes(self):
        """Retourne le stock total en plaquettes."""
        return self.quantite_en_stock * self.quantite_par_carton if self.unite == 'carton' else self.quantite_en_stock

    def augmenter_stock(self, quantite, unite='plaquette'):
        """Augmente le stock uniquement via une commande."""
        if quantite <= 0:
            raise ValueError("La quantité ajoutée doit être positive.")
        quantite_convertie = quantite * self.quantite_par_carton if unite == 'carton' else quantite
        self.quantite_en_stock += quantite_convertie
        self.save()

    def diminuer_stock(self, quantite, unite='plaquette'):
        """Diminue le stock uniquement via un bon de sortie."""
        quantite_convertie = quantite * self.quantite_par_carton if unite == 'carton' else quantite
        if quantite_convertie > self.quantite_totale_plaquettes():
            raise ValueError(f"Stock insuffisant pour {self.nom}.")
        self.quantite_en_stock -= quantite_convertie
        self.save()

    def save(self, *args, **kwargs):
        """Validation avant sauvegarde."""
        if self.quantite_en_stock < 0:
            raise ValueError("La quantité en stock ne peut pas être négative.")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.nom} ({self.quantite_en_stock} {self.unite})"

# Modèle pour les bons de sortie

class BonSortie(models.Model):
    numero = models.CharField(max_length=50, unique=True, blank=True)  # Numéro unique du bon
    destination = models.CharField(max_length=255, default="Infirmerie")  # Destination (e.g. Bloc A, Infirmerie)
    date_sortie = models.DateTimeField(auto_now_add=True)  # Date de création du bon
    valide = models.BooleanField(default=False)  # Indique si le bon est validé

    def save(self, *args, **kwargs):
        """Génération automatique du numéro si non fourni."""
        if not self.numero:
            self.numero = f"BS-{int(now().timestamp())}"  # Numéro unique basé sur le timestamp
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.numero} - {self.destination} ({self.date_sortie.strftime('%d-%m-%Y')})"



class BonSortieProduit(models.Model):
    bon_sortie = models.ForeignKey(
        BonSortie, 
        on_delete=models.CASCADE, 
        related_name="produits"
    )
    produit = models.ForeignKey(
        ProduitPharmaceutique, 
        on_delete=models.CASCADE, 
        related_name="bons_sortie"
    )
    quantite = models.PositiveIntegerField()  # Quantité retirée pour ce produit

    def save(self, *args, **kwargs):
        """Vérification du stock et mise à jour lors de l'ajout du produit au bon."""
        if self.quantite <= 0:
            raise ValidationError(f"La quantité doit être supérieure à 0 pour le produit {self.produit.nom}.")

        # Vérification du stock disponible
        if self.produit.quantite_en_stock < self.quantite:
            raise ValidationError(
                f"Stock insuffisant pour {self.produit.nom} "
                f"(stock disponible : {self.produit.quantite_en_stock})."
            )

        # Réduction du stock dans le modèle ProduitPharmaceutique
        self.produit.diminuer_stock(self.quantite)

        # Ajout au stock de l'infirmerie
        StockInfirmerie.ajouter_stock(self.produit, self.quantite)

        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        """Restauration du stock lors de la suppression du produit du bon."""
        self.produit.quantite_en_stock += self.quantite
        self.produit.save()

        # Réduction dans le stock de l'infirmerie (si applicable)
        StockInfirmerie.retirer_stock(self.produit, self.quantite)

        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.produit.nom} ({self.quantite}) pour {self.bon_sortie.numero}"





# Modèle pour les consultations
from django.db import models
from django.conf import settings

from django.db import models

class Consultation(models.Model):
    patient = models.ForeignKey('Patient', on_delete=models.CASCADE, related_name="consultations")
    maladie = models.CharField(max_length=255)  # Maladie diagnostiquée
    diagnostic = models.TextField(blank=True, null=True)
    produits_prescrits = models.ManyToManyField(
        'ProduitPharmaceutique',
        through='Prescription',  # Relier via un modèle intermédiaire
        related_name="consultations"
    )
    date_consultation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Consultation de {self.patient.nom} {self.patient.prenom} ({self.date_consultation.strftime('%Y-%m-%d')})"


# Modèle pour les rapports
from django.db import models
from django.contrib.auth.models import User

class Rapport(models.Model):
    TYPE_RAPPORT_CHOICES = [
        ('stock', 'Rapport de Stock'),
        ('consultation', 'Rapport de Consultation'),
        ('bon_sortie', 'Rapport de Bon de Sortie'),
    ]

    utilisateur = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='rapports'
    )  # L'utilisateur qui génère le rapport
    type_rapport = models.CharField(
        max_length=50, 
        choices=TYPE_RAPPORT_CHOICES
    )  # Le type de rapport
    date_creation = models.DateTimeField(auto_now_add=True)  # Date de création du rapport
    contenu = models.TextField(
        help_text="Détails ou description du rapport."
    )  # Contenu du rapport (description ou données)
    fichier_pdf = models.FileField(
        upload_to="rapports_pdfs/", 
        null=True, 
        blank=True, 
        help_text="Fichier PDF généré pour le rapport."
    )  # PDF généré

    def __str__(self):
        return f"Rapport {self.type_rapport} - {self.utilisateur.username} ({self.date_creation})"

class AlerteStock(models.Model):
    produit = models.ForeignKey(ProduitPharmaceutique, on_delete=models.CASCADE, related_name="alertes")
    quantite_restante = models.PositiveIntegerField()
    date_alerte = models.DateTimeField(auto_now_add=True)
    message = models.TextField()

    def __str__(self):
        return f"Alerte : {self.produit.nom} ({self.quantite_restante} unités restantes)"

class StockInfirmerie(models.Model):
    produit = models.OneToOneField(ProduitPharmaceutique, on_delete=models.CASCADE)
    quantite_disponible = models.IntegerField(default=0)  # Stock en unités minimales

    def __str__(self):
        return f"{self.produit.nom}: {self.quantite_disponible} unités disponibles"

    def save(self, *args, **kwargs):
        """ Vérifie et met à jour les alertes après modification du stock """
        super().save(*args, **kwargs)
        self.verifier_alerte_stock()

    def verifier_alerte_stock(self):
        """ Génère ou supprime une alerte si le stock est faible """
        SEUIL_CRITIQUE = 10  # Seuil d'alerte

        if self.quantite_disponible <= SEUIL_CRITIQUE:
            # Création ou mise à jour de l'alerte si le stock est critique
            AlerteStock.objects.update_or_create(
                produit=self.produit,
                defaults={
                    "quantite_restante": self.quantite_disponible,
                    "message": f"Le stock de {self.produit.nom} est faible ({self.quantite_disponible} unités restantes)."
                }
            )
        else:
            # Supprime l'alerte si le stock est rétabli
            AlerteStock.objects.filter(produit=self.produit).delete()

    @classmethod
    def ajouter_stock(cls, produit, quantite):
        """Ajoute du stock et vérifie les alertes"""
        stock, created = cls.objects.get_or_create(produit=produit)
        stock.quantite_disponible += quantite
        stock.save()

    @classmethod
    def retirer_stock(cls, produit, quantite):
        """Réduit le stock en cas de prescription et génère une alerte si nécessaire"""
        stock = cls.objects.get(produit=produit)
        stock.quantite_disponible = max(0, stock.quantite_disponible - quantite)
        stock.save()


class Prescription(models.Model):
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='prescriptions')
    produit = models.ForeignKey('ProduitPharmaceutique', on_delete=models.CASCADE)
    quantite_prescrite = models.PositiveIntegerField()
    date = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        """Mise à jour du stock de l’infirmerie après prescription"""
        super().save(*args, **kwargs)
        StockInfirmerie.retirer_stock(self.produit, self.quantite_prescrite)

    def __str__(self):
        return f"{self.produit.nom} - {self.quantite_prescrite} unités prescrites"


class Patient(models.Model):
    SEXE_CHOICES = [
        ('Homme', 'Homme'),
        ('Femme', 'Femme'),
    ]

    nom = models.CharField(max_length=255)
    prenom = models.CharField(max_length=255)  # Ajout du prénom
    age = models.PositiveIntegerField()
    sexe = models.CharField(max_length=10, choices=SEXE_CHOICES, default='Homme')  # Nouveau champ sexe
    section = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.nom} {self.prenom} ({self.age} ans) - {self.section}"


class Alert(models.Model):
    TYPE_ALERT_CHOICES = [
        ('stock_critique', 'Stock critique'),
        ('peremption', 'Produit proche de la péremption'),
        ('rupture', 'Rupture de stock'),
    ]

    produit = models.ForeignKey(
        ProduitPharmaceutique, 
        on_delete=models.CASCADE, 
        related_name="alerts"
    )
    type_alert = models.CharField(
        max_length=50, 
        choices=TYPE_ALERT_CHOICES
    )
    message = models.TextField()  # Description de l'alerte
    date_creation = models.DateTimeField(auto_now_add=True)
    utilisateur = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name="alerts"
    )  # L'utilisateur concerné par l'alerte (optionnel)
    statut = models.BooleanField(default=False)  # Indique si l'alerte est résolue

    def __str__(self):
        return f"Alerte : {self.type_alert} - {self.produit.nom} ({'Résolue' if self.statut else 'Non résolue'})"


class Commande(models.Model):
    fournisseur = models.CharField(max_length=255, default='Ministère')  # Ajout du champ fournisseur
    date_reception = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commande {self.id} - {self.fournisseur} ({self.date_reception.strftime('%Y-%m-%d')})"

class CommandeProduit(models.Model):
    commande = models.ForeignKey(Commande, on_delete=models.CASCADE, related_name="produits_commandes")
    produit = models.ForeignKey(ProduitPharmaceutique, on_delete=models.CASCADE, related_name="commandes")
    quantite = models.PositiveIntegerField()

    def save(self, *args, **kwargs):
        """Augmente le stock du produit lorsqu'une commande est enregistrée."""
        self.produit.augmenter_stock(self.quantite)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.produit.nom} - {self.quantite} unités ajoutées"
