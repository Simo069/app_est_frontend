import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SelectionProvider } from './context/SelectionContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/header';
import Footer from './components/Footer';
import SelectionGuard from './components/SelectionGuard';
import './App.css';

import SelectionLayout from './routes/selection/SelectionLayout';
import NiveauSelection from './routes/selection/NiveauSelection';
import FiliereSelection from './routes/selection/FiliereSelection';

import ModulesPage from './routes/modules/ModulesPage';
import ModuleDetailPage from './routes/modules/ModuleDetailPage';
import RegisterPage from './routes/auth/RegisterPage';
import ProfilePage from './routes/profile/ProfilePage';
import ExamsPage from './routes/exams/ExamsPage';

// Admin Sub-Routes
import AdminGuard from './components/AdminGuard';
import AdminLayout from './routes/admin/AdminLayout';
import AdminOverviewPage from './routes/admin/pages/AdminOverviewPage';
import AdminNiveauxPage from './routes/admin/pages/AdminNiveauxPage';
import AdminFilieresPage from './routes/admin/pages/AdminFilieresPage';
import AdminSemestresPage from './routes/admin/pages/AdminSemestresPage';
import AdminModulesPage from './routes/admin/pages/AdminModulesPage';
import AdminRessourcesPage from './routes/admin/pages/AdminRessourcesPage';
import AdminUsersPage from './routes/admin/pages/AdminUsersPage';

import ProtectedSelectionRoute from './components/ProtectedSelectionRoute';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Authenticated Student Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/examens" element={<ExamsPage />} />
          </Route>

          {/* Admin Protected Modular Sub-Routes */}
          <Route element={<AdminGuard />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="/admin/overview" replace />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="niveaux" element={<AdminNiveauxPage />} />
              <Route path="filieres" element={<AdminFilieresPage />} />
              <Route path="semestres" element={<AdminSemestresPage />} />
              <Route path="modules" element={<AdminModulesPage />} />
              <Route path="ressources" element={<AdminRessourcesPage />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>
          </Route>

          {/* Routes de sélection */}
          <Route path="/selection" element={<SelectionLayout />}>
            <Route index element={<Navigate to="/selection/niveau" replace />} />
            <Route path="niveau" element={<NiveauSelection />} />
            <Route element={<ProtectedSelectionRoute required='niveau' />}>
              <Route path="filiere" element={<FiliereSelection />} />
            </Route>
          </Route>

          {/* Routes protégées par sélection */}
          <Route element={<SelectionGuard />}>
            <Route path="/" element={<Navigate to="/modules" replace />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/modules/:moduleId" element={<ModuleDetailPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/modules" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes, pas de refetch inutile
      gcTime: 10 * 60 * 1000, // Conservation des données 10 min
      refetchOnWindowFocus: false, // Empêche les refetch inutiles au changement d'onglet
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <SelectionProvider>
            <AppContent />
          </SelectionProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
