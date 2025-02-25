from django.contrib import admin

# Register your models here.
#from .models import Utilisateur, ProduitPharmaceutique, BonSortie, Consultation, Rapport

#admin.site.register(Utilisateur)
#admin.site.register(ProduitPharmaceutique)
#admin.site.register(BonSortie)
#admin.site.register(Consultation)
#admin.site.register(Rapport)

#class Rapport(admin.ModelAdmin):
 #   list_display = ('type_rapport', 'utilisateur', 'date_creation')
  #  list_filter = ('type_rapport', 'date_creation')
   # search_fields = ('contenu',)

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Utilisateur, ProduitPharmaceutique, BonSortie, 
    Consultation, Patient, Rapport, Alert, 
    StockInfirmerie, AlerteStock
)
from django.utils.html import format_html
from django.urls import reverse
from django.utils.translation import gettext_lazy as _

@admin.register(Utilisateur)
class UtilisateurAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'date_joined', 'last_login')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('username',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Informations personnelles'), {'fields': ('first_name', 'last_name', 'email')}),
        (_('Rôle et permissions'), {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser'),
        }),
        (_('Dates importantes'), {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'role'),
        }),
    )

@admin.register(ProduitPharmaceutique)
class ProduitPharmaceutiqueAdmin(admin.ModelAdmin):
    list_display = ('nom', 'numero_lot', 'quantite_en_stock', 'unite', 'date_peremption', 'statut_stock')
    list_filter = ('unite', 'date_peremption')
    search_fields = ('nom', 'numero_lot')
    ordering = ('nom',)
    
    def statut_stock(self, obj):
        if obj.quantite_en_stock <= 10:
            return format_html('<span style="color: red;">Stock critique</span>')
        elif obj.quantite_en_stock <= 20:
            return format_html('<span style="color: orange;">Stock bas</span>')
        return format_html('<span style="color: green;">Stock normal</span>')
    
    statut_stock.short_description = 'Statut du stock'

@admin.register(StockInfirmerie)
class StockInfirmerieAdmin(admin.ModelAdmin):
    list_display = ('produit', 'quantite_disponible', 'statut_stock')
    list_filter = ('produit__unite',)
    search_fields = ('produit__nom',)
    
    def statut_stock(self, obj):
        if obj.quantite_disponible <= 5:
            return format_html('<span style="color: red;">Critique</span>')
        elif obj.quantite_disponible <= 10:
            return format_html('<span style="color: orange;">Bas</span>')
        return format_html('<span style="color: green;">Normal</span>')
    
    statut_stock.short_description = 'Statut'

@admin.register(AlerteStock)
class AlerteStockAdmin(admin.ModelAdmin):
    list_display = ('produit', 'quantite_restante', 'date_alerte', 'status_alerte')
    list_filter = ('date_alerte',)
    search_fields = ('produit__nom',)
    readonly_fields = ('date_alerte',)
    
    def status_alerte(self, obj):
        if obj.quantite_restante <= 5:
            return format_html('<span style="color: red;">⚠️ Urgente</span>')
        return format_html('<span style="color: orange;">⚠️ À surveiller</span>')
    
    status_alerte.short_description = 'Statut'

@admin.register(Rapport)
class RapportAdmin(admin.ModelAdmin):
    list_display = ('type_rapport', 'utilisateur', 'date_creation', 'voir_details')
    list_filter = ('type_rapport', 'date_creation', 'utilisateur')
    search_fields = ('contenu', 'utilisateur__username')
    readonly_fields = ('date_creation',)
    
    def voir_details(self, obj):
        if obj.fichier_pdf:
            return format_html(
                '<a href="{}" target="_blank">Voir PDF</a>',
                reverse('admin:rapport-pdf', args=[obj.pk])
            )
        return "Pas de PDF"
    
    voir_details.short_description = 'Détails'

# Enregistrement des autres modèles avec des configurations de base
admin.site.register(BonSortie)
admin.site.register(Consultation)
admin.site.register(Patient)
admin.site.register(Alert)

# Personnalisation de l'interface d'administration
admin.site.site_header = 'Administration du Système Pharmaceutique'
admin.site.site_title = 'Gestion Pharmaceutique'
admin.site.index_title = 'Tableau de bord administrateur'