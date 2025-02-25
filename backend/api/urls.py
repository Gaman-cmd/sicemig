#urls.py
from django.urls import path
from .views import test_api
from .views import ProduitPharmaceutiqueListCreate, ProduitPharmaceutiqueDetail
from .views import BonSortieListCreate
from .views import ConsultationListCreateAPIView
#from .views import ListePatients
from .views import ConsultationListCreateAPIView
from .views import RapportListCreateAPIView
from .views import AlertListCreateAPIView, AlertUpdateAPIView
from .views import ConsultationDetailAPIView
from .views import LoginAPIView
from .views import MagasinierStatsView
from .views import admin_dashboard
from api.views import BonSortieCRUD
from .views import RapportPDFAPIView
from .views import AlerteStockListAPIView
from .views import PatientListCreateAPIView, PatientDetailAPIView
from .views import CommandeListCreateAPIView, CommandeDetailAPIView
from api.views import StockInfirmerieListAPIView, ModifierStockInfirmerieAPIView
urlpatterns = [
    path("auth/login/", LoginAPIView.as_view(), name="login"),
    path('test/', test_api),
    path('commandes/', CommandeListCreateAPIView.as_view(), name='commande-list-create'),
    path('commandes/<int:pk>/', CommandeDetailAPIView.as_view(), name='commande-detail'),
    path('produits/', ProduitPharmaceutiqueListCreate.as_view(), name='produits-list-create'),
    path('produits/<int:pk>/', ProduitPharmaceutiqueDetail.as_view(), name='produit-detail'),
    path('bons_sortie/', BonSortieListCreate.as_view(), name='bons-sortie-list-create'),
    path('bons_sortie/<int:pk>/', BonSortieCRUD.as_view(), name='bons-sortie-detail'),
    path('consultations/', ConsultationListCreateAPIView.as_view(), name='consultations-list-create'),
    #path('liste-patients/', ListePatients.as_view(), name='liste-patients'),
    path("consultations/", ConsultationListCreateAPIView.as_view(), name="consultations-list-create"),
    path('rapports/', RapportListCreateAPIView.as_view(), name='rapport-list-create'),
    path('rapports/<int:pk>/pdf/', RapportPDFAPIView.as_view(), name='rapport-pdf'),
    path('alerts/', AlertListCreateAPIView.as_view(), name='alert-list-create'),
    path('alerts/<int:pk>/', AlertUpdateAPIView.as_view(), name='alert-update'),
    path('consultations/<int:pk>/', ConsultationDetailAPIView.as_view(), name='consultation-detail'),
    path('accueil/', MagasinierStatsView.as_view(), name='magasinier-stats'),
    path('patients/', PatientListCreateAPIView.as_view(), name='patients-list-create'),
    path('patients/<int:pk>/', PatientDetailAPIView.as_view(), name='patient-detail'),
    path('stock_infirmerie/', StockInfirmerieListAPIView.as_view(), name='stock-infirmerie-list'),
    path('stock_infirmerie/modifier/<int:produit__id>/', ModifierStockInfirmerieAPIView.as_view(), name='modifier-stock-infirmerie'),
    path('alertes/', AlerteStockListAPIView.as_view(), name='alertes-list'),
    path('admins/dashboards/', admin_dashboard, name='admin-dashboard'),
]





