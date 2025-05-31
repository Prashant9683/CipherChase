// src/pages/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the OAuth callback
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        });
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-2xl font-medium text-[#1A3A5A]">Completing sign in...</h2>
                <p className="text-gray-600 mt-2">Please wait while we finish authenticating you.</p>
            </div>
        </div>
    );
};

export default AuthCallback;