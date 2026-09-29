import React, { useState } from 'react';
import { User, VacationRequest } from '../types';
import { 
  Factory, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Bell, 
  ChevronDown, 
  Flame, 
  Users, 
  Calendar,
  CheckCircle2,
  RefreshCw,
  Database
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  allUsers: User[];
  requests: VacationRequest[];
  onSwitchUser: (user: User) => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onResetData: () => void;
  onOpenSecretOwner: () => void;
  onOpenSupabase: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  requests,
  onSwitchUser,
  onLogout,
  onOpenLogin,
  onResetData,
  onOpenSecretOwner,
  onOpenSupabase
}) => {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const isOwner = currentUser?.role === 'owner';

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Company Branding - Clickable for Hidden Owner Access */}
          <button
            type="button"
            onClick={onOpenSecretOwner}
            className="flex items-center space-x-3.5 text-left group cursor-pointer hover:opacity-95 transition-opacity"
            title="Acesso da Diretoria (Proprietário)"
          >
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 shadow-lg shadow-amber-500/20 border border-amber-400/40 group-hover:scale-105 transition-transform">
              <Factory className="w-6 h-6 text-slate-950" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-950 flex items-center justify-center">
                <Flame className="w-2.5 h-2.5 text-amber-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-wider text-slate-100 uppercase group-hover:text-amber-300 transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Muniz <span className="text-amber-400">Metalúrgica</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase bg-slate-800 text-amber-300 border border-amber-500/30">
                  Indústria & Caldeiraria
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Sistema de Gestão & Escala de Férias
              </p>
            </div>
          </button>

          {/* Right Section: User & Quick Switcher */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {currentUser ? (
              <>
                {/* Pending requests badge for owner */}
                {isOwner && (
                  <div className="relative hidden md:flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
                    <Bell className="w-4 h-4 text-amber-400 mr-2" />
                    <span>Pendentes:</span>
                    <span className={`ml-1.5 px-1.5 py-0.2 rounded font-bold ${
                      pendingCount > 0 
                        ? 'bg-amber-500 text-slate-950 animate-pulse' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {pendingCount}
                    </span>
                  </div>
                )}

                {/* Supabase Connection Button */}
                <button
                  onClick={onOpenSupabase}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-400 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  title="Configurar URL e API Key do Supabase"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Supabase</span>
                </button>

                {/* Profile Selector Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                    className="flex items-center space-x-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 hover:border-amber-500/50 rounded-xl px-3 py-2 transition-all cursor-pointer shadow-sm group"
                    title="Clique para alternar entre Proprietário e Colaboradores"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      isOwner 
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/40' 
                        : 'bg-sky-600 text-white'
                    }`}>
                      {isOwner ? <ShieldCheck className="w-5 h-5" /> : currentUser.name.charAt(0)}
                    </div>
                    
                    <div className="text-left hidden sm:block">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition-colors">
                          {currentUser.name}
                        </span>
                        {isOwner ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            PROPRIETÁRIO
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                            COLABORADOR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {currentUser.jobTitle}
                      </p>
                    </div>

                    <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-transform duration-200" />
                  </button>

                  {/* Dropdown Menu */}
                  {showSwitchMenu && (
                    <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="p-3 bg-slate-950/80 border-b border-slate-800">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Alternar Usuário para Teste
                          </span>
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                            1 Clique
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Alterne entre os colaboradores da fábrica para testar suas solicitações.
                        </p>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1.5">
                        {allUsers.filter(u => u.role !== 'owner').map((user) => {
                          const isActive = user.id === currentUser.id;
                          return (
                            <button
                              key={user.id}
                              onClick={() => {
                                onSwitchUser(user);
                                setShowSwitchMenu(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all ${
                                isActive 
                                  ? 'bg-sky-500/15 border border-sky-500/30 text-sky-200' 
                                  : 'hover:bg-slate-800/80 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center space-x-2.5">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs bg-slate-700 text-slate-200">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-xs font-bold text-slate-200">
                                      {user.name}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400">
                                    {user.jobTitle} • {user.phone}
                                  </p>
                                </div>
                              </div>
                              {isActive && (
                                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setShowSwitchMenu(false);
                            onResetData();
                          }}
                          className="flex items-center space-x-1.5 text-[11px] text-slate-400 hover:text-amber-400 transition-colors p-1"
                          title="Restaura os dados originais da metalúrgica"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Restaurar Padrões</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowSwitchMenu(false);
                            onLogout();
                          }}
                          className="flex items-center space-x-1.5 text-[11px] text-rose-400 hover:text-rose-300 transition-colors p-1 font-medium"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sair da Conta</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Logout button */}
                <button
                  onClick={onLogout}
                  className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-sm"
              >
                <UserIcon className="w-4 h-4" />
                <span>Entrar no Sistema</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
