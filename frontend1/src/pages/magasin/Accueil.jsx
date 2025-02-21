import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Package, ShoppingCart, ClipboardList, AlertTriangle, TrendingUp, Archive, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Accueil = () => {
  const [stats, setStats] = useState({
    produits: {
      total: 0,
      enRupture: 0,
      prochesExpiration: 0,
      categories: []
    },
    commandes: {
      total: 0,
      enAttente: 0,
      recues: 0,
      parMois: []
    },
    bonsSortie: {
      total: 0,
      quantiteTotale: 0,
      destinations: [],
      parDate: []
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produitsRes, commandesRes, bonsSortieRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/api/produits/'),
          axios.get('http://127.0.0.1:8000/api/commandes/'),
          axios.get('http://127.0.0.1:8000/api/bons_sortie/')
        ]);

        // Traitement des données des produits
        const produits = produitsRes.data;
        const enRupture = produits.filter(p => p.quantite_en_stock <= 20).length;
        const prochesExpiration = produits.filter(p => {
          const datePeremption = new Date(p.date_peremption);
          const differenceJours = Math.floor((datePeremption - new Date()) / (1000 * 60 * 60 * 24));
          return differenceJours < 30;
        }).length;

        // Traitement des données des commandes
        const commandes = commandesRes.data;
        const commandesParMois = Array(6).fill(0).map((_, index) => {
          const date = new Date();
          date.setMonth(date.getMonth() - index);
          const moisCommandes = commandes.filter(c => {
            const commandeDate = new Date(c.date_reception);
            return commandeDate.getMonth() === date.getMonth() && 
                   commandeDate.getFullYear() === date.getFullYear();
          });
          return {
            mois: date.toLocaleString('fr-FR', { month: 'short' }),
            total: moisCommandes.length
          };
        }).reverse();

        // Traitement des données des bons de sortie
        const bonsSortie = bonsSortieRes.data;
        const destinations = {};
        bonsSortie.forEach(bon => {
          destinations[bon.destination] = (destinations[bon.destination] || 0) + 1;
        });

        const destinationsData = Object.entries(destinations).map(([name, value]) => ({
          name,
          value
        }));

        setStats({
          produits: {
            total: produits.length,
            enRupture,
            prochesExpiration,
            categories: [
              { name: 'En stock', value: produits.length - enRupture },
              { name: 'En rupture', value: enRupture },
              { name: 'Proche expiration', value: prochesExpiration }
            ]
          },
          commandes: {
            total: commandes.length,
            enAttente: commandes.filter(c => c.status === 'EN_ATTENTE').length,
            recues: commandes.filter(c => c.status === 'RECU').length,
            parMois: commandesParMois
          },
          bonsSortie: {
            total: bonsSortie.length,
            quantiteTotale: bonsSortie.reduce((acc, bon) => 
              acc + bon.produits.reduce((sum, p) => sum + p.quantite, 0), 0
            ),
            destinations: destinationsData,
            parDate: bonsSortie.slice(-6).map(bon => ({
              date: new Date(bon.date_sortie).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
              quantite: bon.produits.reduce((sum, p) => sum + p.quantite, 0)
            }))
          }
        });
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    fetchData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Tableau de Bord</h1>
      
      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Produits</CardTitle>
            <Package className="text-blue-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{stats.produits.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Commandes en Attente</CardTitle>
            <ShoppingCart className="text-yellow-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{stats.commandes.enAttente}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Produits en Rupture</CardTitle>
            <AlertTriangle className="text-red-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{stats.produits.enRupture}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Bons de Sortie</CardTitle>
            <ClipboardList className="text-green-500" size={20} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-700">{stats.bonsSortie.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des commandes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Évolution des Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.commandes.parMois}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Commandes" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution des produits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">État des Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.produits.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {stats.produits.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bons de sortie par destination */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Destinations des Bons de Sortie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.bonsSortie.destinations}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" name="Nombre de bons" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Quantités sorties récentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quantités Sorties Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.bonsSortie.parDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantite" fill="#ffc658" name="Quantité" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Accueil;