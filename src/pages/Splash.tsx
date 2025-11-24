import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/ui/AppLogo';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#0A1F63] flex flex-col items-center justify-center">
      <AppLogo className="h-24 w-auto" />
    </div>
  );
}
