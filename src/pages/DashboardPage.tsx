// src/pages/DashboardPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Assuming path is correct
import Dashboard from '../components/dashboard/Dashboard'; // Assuming path is correct
import Loader from '../components/ui/Loader'; // Assuming you have a Loader component

const DashboardPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();

  if (authLoading) {
    // Consistent loading state display
    return (
        <div className="flex justify-center items-center h-screen">
          <Loader message="Authenticating..." />
        </div>
    );
  }

  if (!user) {
    // If not authenticated, redirect to the login page
    // The 'replace' prop is good practice here to prevent a history loop
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the Dashboard component
  return <Dashboard />;
};

export default DashboardPage;
