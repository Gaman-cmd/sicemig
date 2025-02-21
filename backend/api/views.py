#views.py
from django.shortcuts import render
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework import status
from .models import CommandeProduit, ProduitPharmaceutique
from .serializers import ProduitPharmaceutiqueSerializer
from .models import BonSortie
from .serializers import BonSortieSerializer
from .models import Consultation
from .serializers import ConsultationSerializer
from django.db.models import Sum
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter
#from .filters import ConsultationFilter
from .models import StockInfirmerie, Prescription
from rest_framework import generics
from .models import Rapport
from .serializers import RapportSerializer
from .models import Alert
from .serializers import AlertSerializer
from rest_framework.filters import SearchFilter, OrderingFilter
from django.shortcuts import get_object_or_404
from .models import Commande, ProduitPharmaceutique, BonSortieProduit
from .serializers import CommandeSerializer
from .models import Commande, BonSortie
from .serializers import CommandeSerializer
from django.db.models import Q
from .serializers import BonSortieSerializer
from django.http import FileResponse
from rest_framework.pagination import PageNumberPagination
from io import BytesIO
from reportlab.pdfgen import canvas 
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now, timedelta
from django.db import transaction
from .models import Patient
from .serializers import PatientSerializer
# Create your views here.
from django.http import JsonResponse

def test_api(request):
    return JsonResponse({'message': 'Hello from Django!'})


def convertir_quantite(produit, quantite, unite):
    """Convertir les quantités selon l'unité du produit."""
    if unite == 'carton' and produit.unite == 'plaquette':
        return quantite * produit.quantite_par_carton
    return quantite

class ProduitPharmaceutiqueListCreate(APIView):
    def get(self, request):
        produits = ProduitPharmaceutique.objects.all()
        serializer = ProduitPharmaceutiqueSerializer(produits, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProduitPharmaceutiqueSerializer(data=request.data)
        
        if serializer.is_valid():
            # ✅ Suppression de la vérification du numéro de lot
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        
        


class ProduitPharmaceutiqueDetail(APIView):
    def get_object(self, pk):
        try:
            return ProduitPharmaceutique.objects.get(pk=pk)
        except ProduitPharmaceutique.DoesNotExist:
            return None

    def get(self, request, pk):
        produit = self.get_object(pk)
        if produit is None:
            return Response({"message": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProduitPharmaceutiqueSerializer(produit)
        return Response(serializer.data)

    def put(self, request, pk):
        produit = self.get_object(pk)
        if produit is None:
            return Response({"message": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProduitPharmaceutiqueSerializer(produit, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        produit = self.get_object(pk)
        if produit is None:
            return Response({"message": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProduitPharmaceutiqueSerializer(produit, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        produit = self.get_object(pk)
        if produit is None:
            return Response({"message": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        produit.delete()
        return Response({"message": "Produit supprimé avec succès."}, status=status.HTTP_204_NO_CONTENT)


class BonSortieListCreate(APIView):
    def get(self, request):
        bons = BonSortie.objects.all()
        serializer = BonSortieSerializer(bons, many=True)
        return Response(serializer.data)
    
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data
        produits = data.get('produits', [])

        if not produits:
            return Response({"error": "Aucun produit fourni."}, status=400)

        # Créer le bon de sortie
        try:
            with transaction.atomic():
                bon = BonSortie.objects.create(
                    destination=data.get('destination'),
                    date_sortie=data.get('date_sortie')
                )

                for produit_data in produits:
                    produit_id = produit_data.get('produit')
                    quantite = produit_data.get('quantite')

                    if not produit_id or quantite is None:
                        return Response({"error": "Chaque produit doit avoir un ID et une quantité."}, status=400)

                    produit = ProduitPharmaceutique.objects.get(id=produit_id)
                    if produit.quantite_en_stock < quantite:
                        return Response({"error": f"Stock insuffisant pour le produit ID {produit_id}."}, status=400)

                    # Réduire le stock du produit
                    # produit.quantite_en_stock -= quantite
                    #produit.save()

                    # Ajouter l'entrée dans la table intermédiaire
                    BonSortieProduit.objects.create(
                        bon_sortie=bon,  # Assurez-vous d'utiliser le bon champ
                        produit=produit,
                        quantite=quantite
                    )

                return Response({"message": "Bon de sortie créé avec succès."}, status=201)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

class BonSortieCRUD(APIView):
    def get(self, request, pk=None):
        """Liste des bons de sortie ou détails d'un bon spécifique."""
        if pk:
            try:
                bon = BonSortie.objects.get(pk=pk)
                serializer = BonSortieSerializer(bon)
                return Response(serializer.data)
            except BonSortie.DoesNotExist:
                return Response({"message": "Bon de sortie non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        else:
            bons = BonSortie.objects.all()
            serializer = BonSortieSerializer(bons, many=True)
            return Response(serializer.data)

    def post(self, request):
        """Création d'un nouveau bon de sortie."""
        serializer = BonSortieSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        """Mise à jour d'un bon de sortie existant."""
        try:
            bon = BonSortie.objects.get(pk=pk)
            serializer = BonSortieSerializer(bon, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except BonSortie.DoesNotExist:
            return Response({"message": "Bon de sortie non trouvé"}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk=None):
        """Suppression d'un bon de sortie avec restauration du stock."""
        try:
            bon = BonSortie.objects.get(pk=pk)
            for produit in bon.produits.all():
                produit.produit.quantite_en_stock += produit.quantite
                produit.produit.save()
            bon.delete()
            return Response({"message": "Bon de sortie supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)
        except BonSortie.DoesNotExist:
            return Response({"message": "Bon de sortie non trouvé"}, status=status.HTTP_404_NOT_FOUND)

class ConsultationListCreateAPIView(APIView):
    def get(self, request):
        consultations = Consultation.objects.all()
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ConsultationSerializer(data=request.data)
        if serializer.is_valid():
            consultation = serializer.save()

            # Ajouter plusieurs produits et gérer les quantités
            for prescription_data in request.data.get('prescriptions', []):
                produit_id = prescription_data['produit']
                quantite_prescrite = prescription_data['quantite_prescrite']

                # Vérifier si le stock est suffisant
                stock = StockInfirmerie.objects.get(produit_id=produit_id)
                if stock.quantite_disponible < quantite_prescrite:
                    return Response(
                        {"message": f"Stock insuffisant pour le produit ID {produit_id}."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Réduire le stock
                stock.quantite_disponible -= quantite_prescrite
                stock.save()

                # Créer la prescription
                Prescription.objects.create(
                    consultation=consultation,
                    produit_id=produit_id,
                    quantite_prescrite=quantite_prescrite
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
  

class PatientListCreateAPIView(APIView):
    def get(self, request):
        patients = Patient.objects.all()
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PatientListCreateAPIView(APIView):
    # Liste tous les patients ou créer un nouveau patient
    def get(self, request):
        patients = Patient.objects.all()
        serializer = PatientSerializer(patients, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PatientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PatientDetailAPIView(APIView):
    # Récupérer, mettre à jour ou supprimer un patient spécifique
    def get_object(self, pk):
        try:
            return Patient.objects.get(pk=pk)
        except Patient.DoesNotExist:
            return None

    def get(self, request, pk):
        patient = self.get_object(pk)
        if patient is None:
            return Response({"error": "Patient introuvable"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PatientSerializer(patient)
        return Response(serializer.data)

    def patch(self, request, pk):
        patient = self.get_object(pk)
        if patient is None:
            return Response({"error": "Patient introuvable"}, status=status.HTTP_404_NOT_FOUND)
        serializer = PatientSerializer(patient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        patient = self.get_object(pk)
        if patient is None:
            return Response({"error": "Patient introuvable"}, status=status.HTTP_404_NOT_FOUND)
        patient.delete()
        return Response({"message": "Patient supprimé avec succès"}, status=status.HTTP_204_NO_CONTENT)

class ConsultationListCreateAPIView(APIView):
    def get(self, request):
        consultations = Consultation.objects.all()
        serializer = ConsultationSerializer(consultations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ConsultationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Appelle `create` qui gère aussi les prescriptions
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ConsultationDetailAPIView(APIView):
    def get_object(self, pk):
        try:
            return Consultation.objects.get(pk=pk)
        except Consultation.DoesNotExist:
            return None

    def get(self, request, pk):
        consultation = self.get_object(pk)
        if consultation is None:
            return Response({"message": "Consultation introuvable."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data)

    def patch(self, request, pk):
        consultation = self.get_object(pk)
        if consultation is None:
            return Response({"message": "Consultation introuvable."}, status=status.HTTP_404_NOT_FOUND)
        serializer = ConsultationSerializer(consultation, data=request.data, partial=True)
        if serializer.is_valid():
            consultation = serializer.save()
            
            # Mise à jour des prescriptions
            for prescription_data in request.data.get('prescriptions', []):
                produit_id = prescription_data['produit']
                quantite_prescrite = prescription_data['quantite_prescrite']

                # Vérifier si le stock est suffisant
                stock = StockInfirmerie.objects.get(produit_id=produit_id)
                if stock.quantite_disponible < quantite_prescrite:
                    return Response(
                        {"message": f"Stock insuffisant pour le produit ID {produit_id}."},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Réduire le stock
                stock.quantite_disponible -= quantite_prescrite
                stock.save()

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        consultation = self.get_object(pk)
        if consultation is None:
            return Response({"message": "Consultation introuvable."}, status=status.HTTP_404_NOT_FOUND)
        consultation.delete()
        return Response({"message": "Consultation supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)
    
class ProduitSearchView(ListAPIView):
    queryset = ProduitPharmaceutique.objects.all()
    serializer_class = ProduitPharmaceutiqueSerializer
    filter_backends = [SearchFilter]
    search_fields = ['nom']  # Recherche basée sur le nom


#Rapport views
class RapportListCreateAPIView(generics.ListCreateAPIView):
    queryset = Rapport.objects.all()
    serializer_class = RapportSerializer
    pagination_class = PageNumberPagination
    filter_backends = [SearchFilter]
    search_fields = ['type_rapport', 'contenu']

    def perform_create(self, serializer):
        rapport = serializer.save()
        
        # Générer un PDF pour ce rapport
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer)
        pdf.drawString(100, 750, f"Rapport de {rapport.utilisateur.username}")
        pdf.drawString(100, 730, f"Type : {rapport.get_type_rapport_display()}")
        pdf.drawString(100, 710, f"Date : {rapport.date_creation.strftime('%Y-%m-%d')}")
        pdf.drawString(100, 690, f"Détails : {rapport.contenu}")
        pdf.save()

        # Sauvegarder le fichier PDF généré
        buffer.seek(0)
        rapport.fichier_pdf.save(f"{rapport.id}_rapport.pdf", buffer)
        buffer.close()

class RapportPDFAPIView(APIView):
    def get(self, request, pk):
        rapport = get_object_or_404(Rapport, pk=pk)
        if rapport.fichier_pdf:
            return FileResponse(rapport.fichier_pdf.open(), content_type="application/pdf")
        return Response({"message": "Le PDF n'a pas encore été généré."}, status=404)
    
    

class AlertListCreateAPIView(generics.ListCreateAPIView):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer

class AlertUpdateAPIView(generics.UpdateAPIView):
    queryset = Alert.objects.all()
    serializer_class = AlertSerializer


class ConsultationDetailAPIView(APIView):
    """
    Vue pour récupérer, mettre à jour ou supprimer une consultation spécifique.
    """

    def get(self, request, pk):
        """Récupérer une consultation par son ID"""
        consultation = get_object_or_404(Consultation, pk=pk)
        serializer = ConsultationSerializer(consultation)
        return Response(serializer.data)

    def put(self, request, pk):
        """Mettre à jour entièrement une consultation (remplace toutes les données)"""
        consultation = get_object_or_404(Consultation, pk=pk)
        serializer = ConsultationSerializer(consultation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        """Mettre à jour partiellement une consultation (ne change que les champs envoyés)"""
        consultation = get_object_or_404(Consultation, pk=pk)
        serializer = ConsultationSerializer(consultation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Supprimer une consultation"""
        consultation = get_object_or_404(Consultation, pk=pk)
        consultation.delete()
        return Response({"message": "Consultation supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
from .models import Utilisateur
import jwt
from django.conf import settings

class LoginAPIView(APIView):
    def post(self, request):
        role = request.data.get("role")
        password = request.data.get("password")

        if not role or not password:
            return Response({"message": "Role et mot de passe requis"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = Utilisateur.objects.get(role=role)
        except Utilisateur.DoesNotExist:
            return Response({"message": "Utilisateur introuvable"}, status=status.HTTP_404_NOT_FOUND)

        if not check_password(password, user.password):
            return Response({"message": "Mot de passe incorrect"}, status=status.HTTP_401_UNAUTHORIZED)

        token = jwt.encode({"id": user.id, "role": user.role}, settings.SECRET_KEY, algorithm="HS256")

        return Response({"token": token, "user": {"id": user.id, "role": user.role}}, status=status.HTTP_200_OK)



class CommandeListCreateAPIView(APIView):
    def get(self, request):
        commandes = Commande.objects.all()
        serializer = CommandeSerializer(commandes, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CommandeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework.exceptions import NotFound
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class CommandeDetailAPIView(APIView):
    def get_object(self, pk):
        try:
            return Commande.objects.get(pk=pk)
        except Commande.DoesNotExist:
            return None

    # Récupérer une commande spécifique
    def get(self, request, pk):
        commande = self.get_object(pk)
        if commande is None:
            return Response({"message": "Commande non trouvée"}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = CommandeSerializer(commande)
        return Response(serializer.data)

    # Modifier une commande existante
    def patch(self, request, pk):
        # Récupérer la commande existante
        commande = get_object_or_404(Commande, pk=pk)
        
        with transaction.atomic():
            # 1. Restaurer le stock en réintégrant les quantités des produits actuellement associés
            old_items = commande.produits_commandes.all()
            for item in old_items:
                produit = item.produit
                produit.quantite_en_stock += item.quantite
                produit.save()
            # Supprimer les anciens éléments de la commande
            old_items.delete()

            # 2. Mettre à jour la commande avec les nouveaux champs (partiellement ou complètement)
            serializer = CommandeSerializer(
                commande, data=request.data, partial=True, context={'request': request}
            )
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            serializer.save()  # Mise à jour des champs simples (par ex. fournisseur, date, etc.)

            # 3. Traiter le nouveau tableau de produits, s'il est présent
            produits_data = request.data.get("produits", [])
            for produit_data in produits_data:
                produit_id = produit_data.get("produit")
                quantite = produit_data.get("quantite")
                if produit_id is None or quantite is None:
                    raise serializers.ValidationError("Chaque produit doit avoir un ID et une quantité.")
                
                produit = get_object_or_404(ProduitPharmaceutique, id=produit_id)
                # Vérifier le stock disponible avant de soustraire
                if produit.quantite_en_stock < quantite:
                    return Response(
                        {"error": f"Stock insuffisant pour {produit.nom} (disponible: {produit.quantite_en_stock})"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                # Soustraire la nouvelle quantité du stock
                produit.quantite_en_stock -= quantite
                produit.save()
                # Créer une nouvelle entrée dans la table intermédiaire
                CommandeProduit.objects.create(
                    commande=commande,
                    produit=produit,
                    quantite=quantite
                )

            # Ré-obtenir la commande mise à jour
            updated_serializer = CommandeSerializer(commande, context={'request': request})
            return Response(updated_serializer.data, status=status.HTTP_200_OK)

    # Supprimer une commande
    def delete(self, request, pk):
        commande = get_object_or_404(Commande, pk=pk)
        with transaction.atomic():
            # Réintégrer le stock pour chaque produit de la commande
            for item in commande.produits_commandes.all():
                produit = item.produit
                produit.quantite_en_stock += item.quantite
                produit.save()
            # Supprimer la commande (les entrées de la table intermédiaire seront supprimées en cascade)
            commande.delete()
        return Response({"message": "Commande supprimée avec succès."}, status=status.HTTP_204_NO_CONTENT)


class MagasinierStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Calcul des statistiques
        total_produits = ProduitPharmaceutique.objects.count()
        produits_rupture = ProduitPharmaceutique.objects.filter(quantite__lte=20).count()
        produits_proches_peremption = ProduitPharmaceutique.objects.filter(
            date_peremption__lte=now() + timedelta(days=30)
        ).count()
        total_bons_sortie = BonSortie.objects.count()
        bons_sortie_dernier_mois = BonSortie.objects.filter(
            date_sortie__gte=now() - timedelta(days=30)
        ).count()

        # Construire la réponse
        data = {
            "total_produits": total_produits,
            "produits_rupture": produits_rupture,
            "produits_proches_peremption": produits_proches_peremption,
            "total_bons_sortie": total_bons_sortie,
            "bons_sortie_dernier_mois": bons_sortie_dernier_mois,
        }
        return Response(data)

from api.models import StockInfirmerie
from api.serializers import StockInfirmerieSerializer

class StockInfirmerieListAPIView(generics.ListAPIView):
    """Retourne la liste des produits en stock à l'infirmerie"""
    queryset = StockInfirmerie.objects.all()
    serializer_class = StockInfirmerieSerializer

class ModifierStockInfirmerieAPIView(generics.UpdateAPIView):
    """Permet de modifier la quantité d’un produit en stock"""
    queryset = StockInfirmerie.objects.all()
    serializer_class = StockInfirmerieSerializer
    lookup_field = 'produit__id'  # On utilise l'ID du produit pour retrouver le stock

    def patch(self, request, *args, **kwargs):
        """Mise à jour du stock avec vérification"""
        stock = self.get_object()
        nouvelle_quantite = request.data.get("quantite_disponible")

        if nouvelle_quantite is None or int(nouvelle_quantite) < 0:
            return Response({"error": "Quantité invalide"}, status=status.HTTP_400_BAD_REQUEST)

        stock.quantite_disponible = int(nouvelle_quantite)
        stock.save()
        return Response(self.get_serializer(stock).data, status=status.HTTP_200_OK)

from rest_framework import generics
from .models import AlerteStock
from .serializers import AlerteStockSerializer

class AlerteStockListAPIView(generics.ListAPIView):
    queryset = AlerteStock.objects.all().order_by('-date_alerte')
    serializer_class = AlerteStockSerializer
