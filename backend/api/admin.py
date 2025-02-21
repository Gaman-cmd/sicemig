from django.contrib import admin

# Register your models here.
from .models import Utilisateur, ProduitPharmaceutique, BonSortie, Consultation, Rapport

admin.site.register(Utilisateur)
admin.site.register(ProduitPharmaceutique)
admin.site.register(BonSortie)
admin.site.register(Consultation)
admin.site.register(Rapport)

class Rapport(admin.ModelAdmin):
    list_display = ('type_rapport', 'utilisateur', 'date_creation')
    list_filter = ('type_rapport', 'date_creation')
    search_fields = ('contenu',)
