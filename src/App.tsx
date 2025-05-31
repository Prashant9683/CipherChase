import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import HomePage from "./pages/HomePage";
import CreateHuntPage from "./pages/CreateHuntPage";
import SolveHuntPage from "./pages/SolveHuntPage";
import LibraryPage from "./pages/LibraryPage";
import DashboardPage from "./pages/DashboardPage";
import AuthCallback from "./pages/AuthCallback";
import HuntPlayerPage from './pages/HuntPlayerPage';

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-secondary-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-treasure p-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateHuntPage />} />
              <Route path="/solve" element={<SolveHuntPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/play/:huntId" element={<HuntPlayerPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
