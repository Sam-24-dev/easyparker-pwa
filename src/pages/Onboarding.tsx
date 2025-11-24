import { useNavigate } from 'react-router-dom';
import { AppLogo } from '../components/ui/AppLogo';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A1F63] text-white flex items-center justify-center px-8 text-center">
      <div className="space-y-10">
        <div className="flex flex-col items-center gap-6">
          <AppLogo className="h-20 w-auto" />
          <div>
            <h1 className="text-4xl font-semibold">¡Empecemos!</h1>
            <p className="text-white/70 mt-3">Tu parqueo favorito en Guayaquil</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/signup')}
          className="inline-flex items-center justify-center px-10 py-3 rounded-full bg-white text-[#0A1F63] font-semibold text-lg shadow-lg hover:bg-white/90 transition"
        >
          ¡Empecemos!
        </button>

        <p className="text-sm text-white/70">
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/signup?mode=login')}
            className="underline font-semibold"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
