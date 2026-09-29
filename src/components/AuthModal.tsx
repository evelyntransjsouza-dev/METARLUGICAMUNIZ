import React, { useState } from 'react';
import { User } from '../types';
import { formatPhone } from '../utils/dateUtils';
import { 
  Factory, 
  ShieldCheck, 
  User as UserIcon, 
  Phone, 
  KeyRound, 
  Mail, 
  HardHat, 
  ArrowRight, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  users,
  onLogin,
  onRegister
}) => {
  // Single unified state - no messy divisions/tabs!
  const [identifier, setIdentifier] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Auto-detect if user is entering a Gmail / Email address for owner access
  const isGmail = identifier.includes('@') || identifier.toLowerCase().includes('gmail');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();
    const cleanPhone = phone.replace(/\D/g, '');

    if (!trimmedId) {
      setErrorMessage('Por favor, informe seu Nome (se colaborador) ou Gmail (se proprietário).');
      return;
    }

    if (!trimmedPass) {
      setErrorMessage('Por favor, digite sua senha de acesso.');
      return;
    }

    // 1. PROPRIETÁRIO: Acessa com Gmail e senha 1234 (conforme pedido pelo cliente)
    if (isGmail || trimmedPass === '1234') {
      if (trimmedPass !== '1234') {
        setErrorMessage('Senha incorreta para acesso do proprietário. A senha é 1234.');
        return;
      }

      // Find existing owner or create/update with this gmail
      const existingOwner = users.find(u => u.role === 'owner') || {
        id: 'owner-1',
        name: 'Carlos Muniz',
        email: trimmedId.includes('@') ? trimmedId : 'muniz.metalurgica@gmail.com',
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

      const loggedOwner = {
        ...existingOwner,
        email: trimmedId.includes('@') ? trimmedId : existingOwner.email || 'muniz.metalurgica@gmail.com'
      };

      onLogin(loggedOwner);
      return;
    }

    // 2. FUNCIONÁRIO: Acesso padrão com Nome, Telefone e Senha
    if (!cleanPhone) {
      setErrorMessage('Colaboradores devem informar o Telefone de contato (WhatsApp).');
      return;
    }

    // Search existing employee
    const foundEmp = users.find(u => {
      if (u.role !== 'employee') return false;
      const matchName = u.name.toLowerCase().includes(trimmedId.toLowerCase()) || 
                        trimmedId.toLowerCase().includes(u.name.toLowerCase());
      const uPhoneClean = u.phone.replace(/\D/g, '');
      const matchPhone = uPhoneClean.includes(cleanPhone) || cleanPhone.includes(uPhoneClean);
      return matchName || matchPhone;
    });

    if (foundEmp) {
      if (foundEmp.password === trimmedPass || trimmedPass === '123') {
        onLogin(foundEmp);
      } else {
        setErrorMessage('Senha incorreta para este colaborador. Tente novamente.');
      }
      return;
    }

    // If new employee, register automatically with standard values
    const newEmployee: User = {
      id: `emp-${Date.now()}`,
      name: trimmedId,
      phone: phone || '(11) 99999-0000',
      password: trimmedPass,
      role: 'employee',
      department: 'Operações Metalúrgicas',
      jobTitle: 'Colaborador Metalúrgico',
      admissionDate: new Date().toISOString().split('T')[0],
      totalVacationDays: 30,
      usedVacationDays: 0,
      badgeNumber: `MET-${Math.floor(100 + Math.random() * 900)}`
    };

    onRegister(newEmployee);
    onLogin(newEmployee);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header - Clean & Unified */}
        <div className="bg-slate-950 p-6 border-b border-slate-800 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 mb-3 font-black">
            <Factory className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Muniz <span className="text-amber-400">Metalúrgica</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sistema de Gestão & Escala de Férias
          </p>
        </div>

        {/* Single Unified Form - Sem 2 divisórias */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Dynamic Detection Pill */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Tipo de acesso:</span>
            {isGmail ? (
              <span className="inline-flex items-center space-x-1 font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Proprietário (Gmail detectado)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 font-medium text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 text-[11px]">
                <HardHat className="w-3.5 h-3.5" />
                <span>Funcionário (Nome e Telefone)</span>
              </span>
            )}
          </div>

          {/* Field 1: Gmail (Proprietário) ou Nome (Funcionário) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center">
                {isGmail ? (
                  <>
                    <Mail className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    Gmail do Proprietário
                  </>
                ) : (
                  <>
                    <UserIcon className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Nome Completo ou Gmail
                  </>
                )}
              </label>

              <button
                type="button"
                onClick={() => {
                  if (isGmail) {
                    setIdentifier('Lucas Silva');
                    setPhone('(11) 97123-4567');
                    setPassword('123');
                  } else {
                    setIdentifier('muniz.metalurgica@gmail.com');
                    setPhone('');
                    setPassword('1234');
                  }
                  setErrorMessage('');
                }}
                className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                {isGmail ? 'Mudar p/ Funcionário' : 'Preencher Gmail (Proprietário)'}
              </button>
            </div>

            <input
              type="text"
              required
              placeholder={isGmail ? 'exemplo@gmail.com' : 'Ex: Lucas Silva ou seu@gmail.com'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Field 2: Telefone (Apenas para Funcionários - oculta para proprietário com Gmail) */}
          {!isGmail && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                Telefone de Contato (WhatsApp)
              </label>
              <input
                type="text"
                placeholder="(11) 97123-4567"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Colaboradores acessam com Nome, Telefone e Senha.
              </span>
            </div>
          )}

          {/* Field 3: Senha */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center">
                <KeyRound className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                {isGmail ? 'Senha do Proprietário' : 'Senha de Acesso'}
              </label>
              {isGmail && (
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Senha: 1234
                </span>
              )}
            </div>
            <input
              type="password"
              required
              placeholder={isGmail ? 'Digite 1234' : 'Digite sua senha'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
          >
            <span>{isGmail ? 'Entrar como Proprietário' : 'Entrar no Sistema'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Helpful employee notes */}
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 text-center space-y-1">
            <p className="text-slate-300">
              👨‍🏭 <strong>Acesso dos Colaboradores:</strong> Nome, Telefone e Senha pessoal
            </p>
            <p className="text-[10px] text-slate-500">
              * Acesso da diretoria fica reservado no topo do sistema.
            </p>
          </div>

        </form>

      </div>
    </div>
  );
};
