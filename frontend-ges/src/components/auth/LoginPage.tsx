import React, { useState } from 'react';
import {
  Lock,
  User,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import logoSpsa from '../../assets/logo-spsa.png';

export const LoginPage: React.FC = () => {
  const { login, registerUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login states
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Register states
  const [regNombre, setRegNombre] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRol, setRegRol] = useState<number>(2); // 2: Operador Logístico, 1: Administrador

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Ingrese su usuario y contraseña.');
      return;
    }

    try {
      setIsLoading(true);
      const success = await login(username.trim(), password.trim());
      if (!success) {
        setErrorMessage('Credenciales incorrectas. Verifique sus datos.');
      }
    } catch {
      setErrorMessage('Ocurrió un error al autenticar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regNombre.trim() || !regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Complete todos los campos del formulario.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMessage('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    try {
      setIsLoading(true);
      const result = await registerUser({
        username: regUsername.trim(),
        password: regPassword.trim(),
        nombreCompleto: regNombre.trim(),
        email: regEmail.trim(),
        idRol: regRol,
      });

      if (result.success) {
        setSuccessMessage(`Registrado correctamente`);
        setUsername(regUsername.trim());
        setPassword(regPassword.trim());
        setRegNombre('');
        setRegUsername('');
        setRegEmail('');
        setRegPassword('');
        setMode('login');
      } else {
        setErrorMessage(result.error || 'No se pudo completar el registro.');
      }
    } catch {
      setErrorMessage('Error al conectar con la base de datos.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-[#00a651] selection:text-white">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-slate-200/90 p-6 space-y-5">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src={logoSpsa}
            alt="Supermercados Peruanos"
            className="h-9 mx-auto object-contain"
          />
          <div>
            <h1 className="text-base font-black text-slate-900 tracking-tight">
              Centro de Acopio SPSA
            </h1>
            <p className="text-[11px] text-slate-500 font-medium">
              Control de Unidades Logísticas
            </p>
          </div>
        </div>

        {/* Mode Switch Pills */}
        <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${mode === 'login'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${mode === 'register'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            Registrarse
          </button>
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Usuario o Correo
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a651] focus:border-[#00a651]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a651] focus:border-[#00a651]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#00a651] hover:bg-[#008f45] active:scale-98 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>{isLoading ? 'Ingresando...' : 'Ingresar'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className="text-[11px] text-slate-500 hover:text-[#00a651] font-semibold cursor-pointer"
              >
                ¿No tienes cuenta? Regístrate aquí
              </button>
            </div>
          </form>
        )}

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
                placeholder="Juan Pérez Quispe"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a651]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Usuario
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().trim())}
                  placeholder="jperez"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a651]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Perfil / Rol
                </label>
                <select
                  value={regRol}
                  onChange={(e) => setRegRol(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a651]"
                >
                  <option value={2}>Personal Logístico</option>
                  <option value={1}>Administrador General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="usuario@spsa.pe"
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a651]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#00a651]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#00a651]" />
              <span>{isLoading ? 'Registrando en BD...' : 'Registrar Usuario'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className="text-[11px] text-slate-500 hover:text-[#00a651] font-semibold cursor-pointer"
              >
                ¿Ya tienes cuenta? Inicia sesión aquí
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-[10px] text-slate-400 pt-1 border-t border-slate-100">
          Supermercados Peruanos S.A.
        </div>
      </div>
    </div>
  );
};