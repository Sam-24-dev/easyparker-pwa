import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { AppLogo } from '../components/ui/AppLogo';

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signup, login } = useAuth();

  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'login') {
      setIsLogin(true);
    }
  }, [searchParams]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && !acceptTerms) {
        setError('Debes aceptar los términos y condiciones para continuar.');
        setLoading(false);
        return;
      }
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.nombre, formData.email, formData.password);
      }
      navigate('/home');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin((prev) => {
      const next = !prev;
      if (next) {
        setAcceptTerms(false);
      }
      return next;
    });
    setError('');
  };

  const isSubmitDisabled = loading || (!isLogin && !acceptTerms);

  return (
    <div className="min-h-screen bg-[#0A1F63] text-white overflow-y-auto">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        <div className="pt-14 px-8 flex justify-center">
          <AppLogo className="h-10 w-auto" />
        </div>

        <div className="mt-auto bg-white text-[#0A1F63] rounded-t-[36px] px-8 py-10 shadow-2xl">
          <div className="text-center mb-8">
            <AppLogo className="h-16 w-auto mx-auto mb-4" />
            <p className="text-xs uppercase tracking-[0.4em] text-gray-400">
              {isLogin ? 'bienvenido' : 'registrarse'}
            </p>
            <h1 className="text-2xl font-bold mt-2">
              {isLogin ? 'Hola de nuevo' : '¡Hola, bienvenido!'}
            </h1>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 text-red-600 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-[#0A1F63] mb-1 block">Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-[#263B7E]/30 rounded-full px-5 py-3 focus:outline-none focus:border-[#5A63F2] text-[#0A1F63]"
                  placeholder="Tu nombre"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-[#0A1F63] mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border-2 border-[#263B7E]/30 rounded-full px-5 py-3 focus:outline-none focus:border-[#5A63F2] text-[#0A1F63]"
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#0A1F63] mb-1 block">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full border-2 border-[#263B7E]/30 rounded-full px-5 py-3 focus:outline-none focus:border-[#5A63F2] text-[#0A1F63] pr-16"
                  placeholder="mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A63F2] text-sm font-semibold"
                >
                  {showPassword ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {!isLogin && (
              <label className="flex items-center gap-3 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="w-4 h-4 rounded border-2 border-[#263B7E]/40 accent-[#5A63F2]"
                />
                Acepto los términos y condiciones
              </label>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full bg-[#6B6FF5] hover:bg-[#575ce4] disabled:bg-[#6B6FF5]/60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>{isLogin ? 'Iniciar sesión' : 'Sign Up'}</span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              type="button"
              onClick={handleToggleMode}
              className="text-[#5A63F2] font-semibold"
            >
              {isLogin ? 'Crear cuenta' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
