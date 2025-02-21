import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardAdmin from "./pages/admin/DashboardAdmin";
import DashboardMagasin from "./pages/magasin/DashboardMagasin";
import DashboardInfirmerie from "./pages/infirmerie/DashboardInfirmerie";
//import Commandes from "./pages/magasin/Commandes";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  const { user } = useAuth(); 

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            {user?.role === "admin" && <DashboardAdmin />}
            {user?.role === "magasinier" && <DashboardMagasin />}
            {(user?.role === "docteur" || user?.role === "infirmier") && (
              <DashboardInfirmerie />
            )}
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
      {/* Routes du magasinier */}
      {/*<Route path="/magasin/produits" element={<ProduitsPage />} />
      <Route path="/magasin/bonsortie" element={<BonSortiePage />} /> */}
      {/*<Route path="/magasin/commandes" element={<Commandes />} /> */}
    </Routes>
  );
}

export default App;
