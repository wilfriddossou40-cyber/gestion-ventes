import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageProvider";
import { ThemeProvider } from "./context/ThemeProvider";
import AppLayout from "./components/app/AppLayout";
import DashboardPage from "./pages/app/DashboardPage";
import ProduitsPage from "./pages/app/ProduitsPage";
import CategoriesPage from "./pages/app/CategoriesPage";
import ClientsPage from "./pages/app/ClientsPage";
import VentesPage from "./pages/app/VentesPage";
import NouvelleVentePage from "./pages/app/NouvelleVentePage";
import StockPage from "./pages/app/StockPage";
import NotFoundPage from "./pages/app/NotFoundPage";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="produits" element={<ProduitsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="ventes/nouvelle" element={<NouvelleVentePage />} />
              <Route path="ventes" element={<VentesPage />} />
              <Route path="stock" element={<StockPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
