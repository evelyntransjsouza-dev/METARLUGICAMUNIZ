import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, Lock, Mail, KeyRound, X, AlertCircle } from 'lucide-react';

interface SecretOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOwnerLogin: (ownerUser: User) => void;
  users: User[];
}

export const SecretOwnerModal: React.FC<SecretOwnerModalProps> = ({
  isOpen,
  onClose,
  onOwnerLogin,
  users
}) => {
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedGmail = gmail.trim();
    const trimmedPass = password.trim();

    if (!trimmedGmail) {
      setError('Por favor, informe seu Gmail de proprietário.');
      return;
    }

    if (trimmedPass !== '1234') {
      setError('Senha incorreta para a diretoria. Acesso restrito com senha 1234.');
      return;
    }

    // Find existing owner or create with specified gmail
    const existingOwner = users.find(u => u.role === 'owner') || {
      id: 'owner-1',
      name: 'Carlos Muniz',
      email: trimmedGmail,
      phone: '(11) 98765-4321',
      password: '1234',
      role: 'owner' as const,
      department: 'Direção Geral & Operações',
      jobTitle: 'Proprietário / Diretor Industrial',
      admissionDate: '2012-03-01',
      totalVacationDays: 30,
      usedVacationDays: 0,
      badgeNumber: 'DIR-001'
    };

    const ownerWithEmail: User = {
      ...existingOwner,
      email: trimmedGmail
    };

    onOwnerLogin(ownerWithEmail);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 border-b border-slate-800 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 mb-2 font-black">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Acesso Restrito da Diretoria
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Muniz Metalúrgica • Portal do Proprietário
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Gmail do Proprietário
            </label>
            <input
              type="email"
              required
              autoFocus
              placeholder="seuemail@gmail.com"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-300 flex items-center">
                <KeyRound className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                Senha do Proprietário
              </label>
              <span className="text-[10px] text-amber-400/90 font-mono">
                (Senha: 1234)
              </span>
            </div>
            <input
              type="password"
              required
              placeholder="Digite 1234"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Acessar Painel do Dono</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setGmail('muniz.metalurgica@gmail.com');
              setPassword('1234');
            }}
            className="w-full text-center text-[10px] text-slate-500 hover:text-amber-400 transition-colors pt-1"
          >
            Preencher dados rápidos de teste (senha 1234)
          </button>
        </form>

      </div>
    </div>
  );
};
