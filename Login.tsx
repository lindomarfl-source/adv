import React, { useState } from 'react';
import { Scale, Lock, Users, ChevronRight } from './Icons';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock Authentication Logic
    setTimeout(() => {
      if (email === 'admin@adv.com' && password === '123456') {
        onLogin();
      } else {
        setError('Credenciais inválidas. Tente admin@adv.com / 123456');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold-500 blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500 blur-[120px]"></div>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10">
        <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-navy-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Scale className="w-8 h-8 text-gold-500" />
                </div>
                <h1 className="text-2xl font-serif font-bold text-navy-900">Gustavo <span className="text-gold-600">Rith</span></h1>
                <p className="text-navy-400 text-sm mt-1 uppercase tracking-wider font-semibold">Advocacia & Consultoria</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold text-navy-600 uppercase ml-1">Email Corporativo</label>
                    <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-navy-200 rounded-lg text-sm text-navy-800 placeholder:text-navy-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                            placeholder="seu@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-semibold text-navy-600 uppercase ml-1">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-navy-200 rounded-lg text-sm text-navy-800 placeholder:text-navy-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium text-center animate-pulse">
                        {error}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-navy-800 hover:bg-navy-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? 'Acessando...' : 'Acessar Painel'}
                    {!loading && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
            </form>
        </div>
        <div className="bg-navy-50 py-4 px-8 text-center border-t border-navy-100">
            <p className="text-xs text-navy-400">
                Esqueceu sua senha? <a href="#" className="text-navy-700 font-semibold hover:underline">Recuperar acesso</a>
            </p>
        </div>
      </div>
    </div>
  );
};