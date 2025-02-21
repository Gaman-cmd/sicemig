from django_filters import rest_framework as filters
from .models import Consultation

class ConsultationFilter(filters.FilterSet):
    patient_nom = filters.CharFilter(field_name='patient_nom', lookup_expr='icontains')  # Recherche partielle
    patient_section = filters.CharFilter(field_name='patient_section', lookup_expr='icontains')  # Recherche partielle
    date_consultation = filters.DateFilter(field_name='date_consultation', lookup_expr='date')  # Exacte date

    class Meta:
        model = Consultation
        fields = ['patient_nom', 'patient_section', 'date_consultation']
