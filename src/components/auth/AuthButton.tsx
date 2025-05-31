import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, User } from 'lucide-react';
import Button from '../ui/Button';
import { signInWithGoogle, signOut } from '../../lib/auth';
import { useAuth } from '../../hooks/useAuth';

const AuthButton: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  if (loading) {
    return (
      <Button disabled variant="ghost" size="sm">
        Loading...
      </Button>
    );
  }
  
  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          icon={<User size={16} />}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<LogOut size={16} />}
          onClick={async () => {
            await signOut();
            navigate('/');
          }}
        >
          Sign Out
        </Button>
      </div>
    );
  }
  
  return (
    <Button
      variant="primary"
      size="sm"
      icon={<LogIn size={16} />}
      onClick={() => signInWithGoogle()}
    >
      Sign in with Google
    </Button>
  );
};

export default AuthButton;