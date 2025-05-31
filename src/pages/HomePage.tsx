// src/pages/HomePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button'; // Assuming path is correct
import { Book, Key, Lock, Map, Compass } from 'lucide-react';
import { signInWithGoogle } from '../lib/auth'; // Assuming path for signInWithGoogle is correct
import { useAuth } from '../hooks/useAuth'; // Import useAuth hook (File `[3]`)

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth(); // Get user and loading state from your auth hook

  const handleSolveHuntClick = async () => {
    if (user) {
      // User is authenticated, navigate to /solve
      navigate('/solve');
    } else {
      // User is not authenticated, trigger Google Sign-In
      try {
        await signInWithGoogle();
        // After successful sign-in, Supabase's onAuthStateChange listener in useAuth
        // should update the user state. You might want to navigate to /solve
        // after sign-in, but that's often handled by a redirect in your auth flow
        // or by the user clicking the button again. For now, just initiating sign-in.
      } catch (error) {
        console.error('Authentication error:', error);
        // Optionally, show an error message to the user
      }
    }
  };

  // Optional: Disable the button while auth state is loading to prevent premature clicks
  const isButtonDisabled = authLoading;
  const howItWorksGridClasses = user
    ? 'grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-start' // For 2 items when user is logged in
    : 'grid grid-cols-1 md:grid-cols-3 gap-10 items-start';
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-6">
          <Compass className="mx-auto h-20 w-20 text-blue-600 mb-6 animate-pulse" />
          <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
            Welcome to <span className="text-blue-600">CipherChase</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Embark on thrilling adventures, decrypt cryptic clues, and unearth
            hidden treasures. Challenge your mind and become a master
            cryptographer!
          </p>
          <div className="flex justify-center">
            <Button
              variant="primary"
              size="lg"
              icon={<Compass size={20} className="mr-2" />} // Added margin for icon
              onClick={handleSolveHuntClick}
              disabled={isButtonDisabled} // Disable button while checking auth state
              className="transform transition-transform duration-150 hover:scale-105" // Added hover effect
            >
              {authLoading
                ? 'Loading...'
                : user
                ? 'Solve a Hunt'
                : 'Solve Hunt'}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why CipherChase?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="feature-card p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Key size={40} className="text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Encrypted Puzzles</h3>
              <p className="text-gray-600 text-sm">
                Create and solve exciting treasure hunts with encrypted puzzles,
                ciphers, and riddles.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="feature-card p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Book size={40} className="text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Diverse Ciphers</h3>
              <p className="text-gray-600 text-sm">
                From Caesar ciphers to anagrams, binary and Morse code, explore
                a wide variety of encryption methods.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="feature-card p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Map size={40} className="text-purple-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Multi-Step Adventures
              </h3>
              <p className="text-gray-600 text-sm">
                Solve multi-step adventures with progressive puzzles that lead
                to a final treasure.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="feature-card p-6 bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <Lock size={40} className="text-red-500 mb-4" />{' '}
              {/* Changed icon for variety */}
              <h3 className="text-xl font-semibold mb-2">Skill Development</h3>
              <p className="text-gray-600 text-sm">
                Develop critical thinking and problem-solving skills while
                learning about encryption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          {/* Apply dynamic grid classes here */}
          <div className={howItWorksGridClasses}>
            {/* Step 1: Conditionally render based on user authentication status */}
            {!user && ( // Only show this if the user is NOT logged in
              <div className="p-6">
                {' '}
                {/* Internal padding of the item */}
                <div className="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Sign Up / Log In</h3>
                <p className="text-gray-600 text-sm">
                  Sign in with your Google account to start solving treasure
                  hunts and tracking your progress.
                </p>
              </div>
            )}
            {/* Step 2 (was 2, now dynamically 1 or 2) */}
            <div className="p-6">
              {' '}
              {/* Internal padding of the item */}
              <div
                className={`bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md`}
              >
                {user ? '1' : '2'}{' '}
                {/* Adjust number based on whether step 1 is shown */}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Choose Your Adventure
              </h3>
              <p className="text-gray-600 text-sm">
                Browse through available treasure hunts and select one that
                interests you. Each hunt offers unique challenges and stories.
              </p>
            </div>
            {/* Step 3 (was 3, now dynamically 2 or 3) */}
            <div className="p-6">
              {' '}
              {/* Internal padding of the item */}
              <div
                className={`bg-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md`}
              >
                {user ? '2' : '3'}{' '}
                {/* Adjust number based on whether step 1 is shown */}
              </div>
              <h3 className="text-xl font-semibold mb-2">Decrypt & Discover</h3>
              <p className="text-gray-600 text-sm">
                Decrypt messages, solve riddles, and unlock the mysteries within
                each treasure hunt.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
