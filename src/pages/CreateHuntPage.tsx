// src/pages/CreateHuntPage.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import HuntCreator from '../components/hunt/HuntCreator';
import Loader from '../components/ui/Loader'; // Assuming Loader component path
import { Feather } from 'lucide-react'; // Icon for creation

const CreateHuntPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth(); // Changed 'loading' to 'authLoading' for clarity

  if (authLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
        <Loader message="Preparing your map..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 py-10 font-sans">
      {' '}
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <Feather className="mx-auto h-16 w-16 text-blue-600 mb-4 animate-bounce" />{' '}
          {/* Simple animation */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 font-serif tracking-tight">
            {' '}
            {/* Thematic font */}
            Craft Your Legend
          </h1>
          <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto">
            Design intricate puzzles, weave compelling narratives, and share
            your unique treasure hunt with the world.
          </p>
        </header>

        <main className="bg-white p-6 sm:p-8 md:p-10 rounded-xl shadow-2xl">
          {/* HuntCreator component will be rendered here.
              It might inherit font styles. If it accepts className, further styling can be applied.
              For now, it's placed within a nicely styled container. */}
          <HuntCreator />
        </main>
      </div>
    </div>
  );
};

export default CreateHuntPage;
