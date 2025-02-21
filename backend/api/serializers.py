#serializers.py
from rest_framework import serializers
from .models import (
    ProduitPharmaceutique, BonSortie, Consultation, Patient, Prescription, 
    Rapport, Alert, Commande, CommandeProduit, BonSortieProduit, Utilisateur, AlerteStock
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'username', 'email', 'role']

# Serializer pour les produits pharmaceutiques
class ProduitPharmaceutiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProduitPharmaceutique
        fields = '__all__'

    # Validation personnalisée pour la quantité
    def validate_quantite(self, value):
        if value < 0:
            raise serializers.ValidationError("La quantité ne peut pas être négative.")
        return value

    # Validation personnalisée pour la date de péremption
    def validate_date_peremption(self, value):
        from datetime import date
        if value < date.today():
            raise serializers.ValidationError("La date de péremption doit être future.")
        return value

# Serializer pour les bons de sortie
class BonSortieProduitSerializer(serializers.ModelSerializer):
    produit_nom = serializers.ReadOnlyField(source='produit.nom')  # Inclure le nom du produit

    class Meta:
        model = BonSortieProduit
        fields = ['id', 'produit', 'produit_nom', 'quantite']  # Inclut les détails du produit


class BonSortieSerializer(serializers.ModelSerializer):
    produits = BonSortieProduitSerializer(many=True, required=False)  # Liste des produits dans le bon (écriture et lecture)

    class Meta:
        model = BonSortie
        fields = ['id', 'numero', 'destination', 'date_sortie', 'produits']

    def create(self, validated_data):
        produits_data = validated_data.pop('produits', [])  # Extraire les produits du payload
        bon_sortie = BonSortie.objects.create(**validated_data)  # Créer le bon de sortie

        # Créer les entrées dans le modèle BonSortieProduit
        for produit_data in produits_data:
            BonSortieProduit.objects.create(
                bon_sortie=bon_sortie,
                produit=produit_data['produit'],
                quantite=produit_data['quantite']
            )

        return bon_sortie

    def update(self, instance, validated_data):
        produits_data = validated_data.pop('produits', None)

        # Mettre à jour le bon de sortie
        instance.numero = validated_data.get('numero', instance.numero)
        instance.destination = validated_data.get('destination', instance.destination)
        instance.date_sortie = validated_data.get('date_sortie', instance.date_sortie)
        instance.save()

        # Si des produits sont fournis, les mettre à jour
        if produits_data:
            instance.produits.clear()  # Supprimer les anciens produits liés
            for produit_data in produits_data:
                BonSortieProduit.objects.create(
                    bon_sortie=instance,
                    produit=produit_data['produit'],
                    quantite=produit_data['quantite']
                )

        return instance

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'nom', 'prenom', 'age', 'sexe', 'section']  # Ajout du champ sexe


# Serializer pour les prescriptions
from rest_framework import serializers
from .models import Consultation, Prescription, StockInfirmerie

class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['id', 'produit', 'quantite_prescrite']

class ConsultationSerializer(serializers.ModelSerializer):
    prescriptions = PrescriptionSerializer(many=True)

    class Meta:
        model = Consultation
        fields = ['id', 'patient', 'maladie', 'diagnostic', 'date_consultation', 'prescriptions']

    def create(self, validated_data):
        prescriptions_data = validated_data.pop('prescriptions')
        consultation = Consultation.objects.create(**validated_data)
        for prescription_data in prescriptions_data:
            Prescription.objects.create(consultation=consultation, **prescription_data)
        return consultation

    def update(self, instance, validated_data):
        prescriptions_data = validated_data.pop('prescriptions', [])

        # Update consultation fields
        instance.patient = validated_data.get('patient', instance.patient)
        instance.maladie = validated_data.get('maladie', instance.maladie)
        instance.diagnostic = validated_data.get('diagnostic', instance.diagnostic)
        instance.date_consultation = validated_data.get('date_consultation', instance.date_consultation)
        instance.save()

        # Update prescriptions
        for prescription_data in prescriptions_data:
            prescription_id = prescription_data.get('id')
            if prescription_id:
                prescription = Prescription.objects.get(id=prescription_id, consultation=instance)
                prescription.produit = prescription_data.get('produit', prescription.produit)
                prescription.quantite_prescrite = prescription_data.get('quantite_prescrite', prescription.quantite_prescrite)
                prescription.save()
            else:
                Prescription.objects.create(consultation=instance, **prescription_data)

        return instance
# Serializer pour les rapports
class RapportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rapport
        fields = '__all__'

# Serializer pour les alertes
class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'

# Serializer pour la relation entre Commande et Produit (CommandeProduit)
class CommandeProduitSerializer(serializers.ModelSerializer):
    produit = ProduitPharmaceutiqueSerializer(read_only=True)  # Afficher les détails du produit
    produit_id = serializers.PrimaryKeyRelatedField(queryset=ProduitPharmaceutique.objects.all(), write_only=True)

    class Meta:
        model = CommandeProduit
        fields = ['id', 'commande', 'produit', 'produit_id', 'quantite']

# Serializer pour les commandes
class CommandeSerializer(serializers.ModelSerializer):
    produits = CommandeProduitSerializer(many=True, source="produits_commandes", read_only=True)
    
    class Meta:
        model = Commande
        fields = ['id', 'fournisseur', 'date_reception', 'produits']

    def create(self, validated_data):
        produits_data = self.context['request'].data.get('produits', [])
        commande = Commande.objects.create(
            fournisseur=validated_data['fournisseur']
        )
        
        for produit_data in produits_data:
            CommandeProduit.objects.create(
                commande=commande,
                produit_id=produit_data['produit'],
                quantite=produit_data['quantite']
            )
        
        return commande
    
from rest_framework import serializers
from api.models import StockInfirmerie

class StockInfirmerieSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source="produit.nom", read_only=True)

    class Meta:
        model = StockInfirmerie
        fields = ["id", "produit_nom", "quantite_disponible"]

class AlerteStockSerializer(serializers.ModelSerializer):
    produit_nom = serializers.CharField(source="produit.nom", read_only=True)

    class Meta:
        model = AlerteStock
        fields = ['id', 'produit_nom', 'quantite_restante', 'message', 'date_alerte']
