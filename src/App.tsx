/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, VacationRequest } from './types';
import { 
  getStoredUsers, 
  saveUsers, 
  getStoredRequests, 
  saveRequests, 
  getStoredSession, 
  saveSession, 
  resetToDefaults 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { OwnerDashboard } from './components/OwnerDashboard';
import { VacationRequestModal } from './components/VacationRequestModal';
import { ApprovalModal } from './components/ApprovalModal';
import { PrintReceiptModal } from './components/PrintReceiptModal';
import { AddEmployeeModal } from './components/AddEmployeeModal';
import { SecretOwnerModal } from './components/SecretOwnerModal';
import { SupabaseModal } from './components/SupabaseModal';
import { 
  fetchUsersFromApi, 
  createUserInApi, 
  fetchRequestsFromApi, 
  createRequestInApi, 
  updateRequestInApi, 
  deleteRequestInApi 
} from './utils/api';
import { Factory, ShieldCheck, HardHat, Sparkles } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [requests, setRequests] = useState<VacationRequest[]>(() => getStoredRequests());
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredSession());

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSecretOwnerModalOpen, setIsSecretOwnerModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedRequestForApproval, setSelectedRequestForApproval] = useState<VacationRequest | null>(null);
  const [isPrintReceiptOpen, setIsPrintReceiptOpen] = useState(false);
  const [selectedRequestForReceipt, setSelectedRequestForReceipt] = useState<VacationRequest | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };
  // Load live data from Cloud SQL / PostgreSQL on startup
  useEffect(() => {
    async function loadData() {
      const [apiUsers, apiRequests] = await Promise.all([
        fetchUsersFromApi(),
        fetchRequestsFromApi(),
      ]);
      if (apiUsers.length > 0) setUsers(apiUsers);
      if (apiRequests.length > 0) setRequests(apiRequests);
    }
    loadData();
  }, []);

  // Sync session on startup
  useEffect(() => {
    if (!currentUser) {
      const defaultOwner = users.find(u => u.role === 'owner') || users[0];
      if (defaultOwner) {
        setCurrentUser(defaultOwner);
        saveSession(defaultOwner);
      }
    }
  }, [users]);

  // Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    saveSession(user);
    setIsAuthModalOpen(false);
    showToast(`Bem-vindo ao sistema da Muniz Metalúrgica, ${user.name}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveSession(null);
    setIsAuthModalOpen(true);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    saveSession(user);
    showToast(`Perfil alterado para: ${user.name} (${user.role === 'owner' ? 'Proprietário' : 'Colaborador'})`);
  };

  const handleRegister = async (newUser: User) => {
    const updated = [newUser, ...users];
    setUsers(updated);
    saveUsers(updated);
    await createUserInApi(newUser);
  };

  const handleCreateRequest = async (newReqData: Omit<VacationRequest, 'id' | 'createdAt' | 'agreedDays' | 'status' | 'ownerNotes'>) => {
    const newRequest: VacationRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      agreedDays: null,
      ownerNotes: ''
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    saveRequests(updated);
    setIsRequestModalOpen(false);
    showToast('Solicitação de férias gravada no banco de dados com sucesso!');
    await createRequestInApi(newRequest);
  };

  const handleApprove = async (
    requestId: string,
    agreedDays: number,
    ownerNotes: string,
    isFullApproval: boolean,
    agreedEndDate: string
  ) => {
    const req = requests.find(r => r.id === requestId);
    const updates = {
      status: (isFullApproval ? 'approved' : 'approved_adjusted') as any,
      agreedDays,
      agreedStartDate: req?.startDate,
      agreedEndDate,
      ownerNotes,
      reviewedAt: new Date().toISOString()
    };

    const updated = requests.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        ...updates
      };
    });

    setRequests(updated);
    saveRequests(updated);
    showToast(`Férias salvas no banco com ${agreedDays} dias acordados!`);
    await updateRequestInApi(requestId, updates);
  };

  const handleQuickApproveFull = async (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return;

    const updates = {
      status: 'approved' as const,
      agreedDays: req.requestedDays,
      agreedStartDate: req.startDate,
      agreedEndDate: req.endDate,
      ownerNotes: `Aprovado integralmente com ${req.requestedDays} dias conforme solicitado!`,
      reviewedAt: new Date().toISOString()
    };

    const updated = requests.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        ...updates
      };
    });

    setRequests(updated);
    saveRequests(updated);
    showToast(`Solicitação de ${req.employeeName} aprovada e atualizada no banco!`);
    await updateRequestInApi(requestId, updates);
  };

  const handleReject = async (requestId: string, ownerNotes: string) => {
    const updates = {
      status: 'rejected' as const,
      ownerNotes,
      reviewedAt: new Date().toISOString()
    };

    const updated = requests.map(r => {
      if (r.id !== requestId) return r;
      return {
        ...r,
        ...updates
      };
    });

    setRequests(updated);
    saveRequests(updated);
    showToast('Decisão gravada no banco de dados.');
    await updateRequestInApi(requestId, updates);
  };

  const handleCancelRequest = async (requestId: string) => {
    const updated = requests.filter(r => r.id !== requestId);
    setRequests(updated);
    saveRequests(updated);
    showToast('Solicitação cancelada e removida do banco de dados.');
    await deleteRequestInApi(requestId);
  };

  const handleAddEmployee = async (newUser: User) => {
    const updated = [newUser, ...users];
    setUsers(updated);
    saveUsers(updated);
    showToast(`Novo colaborador ${newUser.name} cadastrado no banco de dados!`);
    await createUserInApi(newUser);
  };

  const handleResetData = () => {
    const { users: defaultUsers, requests: defaultRequests } = resetToDefaults();
    setUsers(defaultUsers);
    setRequests(defaultRequests);
    setCurrentUser(defaultUsers[0]);
    saveSession(defaultUsers[0]);
    showToast('Dados da Muniz Metalúrgica restaurados para os padrões originais de demonstração.');
  };

  const openApprovalModal = (req: VacationRequest) => {
    setSelectedRequestForApproval(req);
    setIsApprovalModalOpen(true);
  };

  const openReceiptModal = (req: VacationRequest) => {
    setSelectedRequestForReceipt(req);
    setIsPrintReceiptOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-amber-500/50 text-amber-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-5 duration-300 text-xs sm:text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header / Navigation */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        requests={requests}
        onSwitchUser={handleSwitchUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsAuthModalOpen(true)}
        onResetData={handleResetData}
        onOpenSecretOwner={() => setIsSecretOwnerModalOpen(true)}
        onOpenSupabase={() => setIsSupabaseModalOpen(true)}
      />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentUser ? (
          currentUser.role === 'owner' ? (
            <OwnerDashboard
              currentUser={currentUser}
              users={users}
              requests={requests}
              onOpenApprovalModal={openApprovalModal}
              onOpenAddEmployee={() => setIsAddEmployeeOpen(true)}
              onViewReceipt={openReceiptModal}
              onQuickApproveFull={handleQuickApproveFull}
            />
          ) : (
            <EmployeeDashboard
              currentUser={currentUser}
              requests={requests}
              onOpenNewRequest={() => setIsRequestModalOpen(true)}
              onCancelRequest={handleCancelRequest}
              onViewReceipt={openReceiptModal}
            />
          )
        ) : (
          <div className="py-20 text-center space-y-4">
            <Factory className="w-16 h-16 text-amber-400 mx-auto" />
            <h2 className="text-2xl font-bold text-slate-100">Muniz Metalúrgica</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Acesse o sistema com seu Nome, Senha e Telefone para gerenciar suas férias ou aprovar solicitações.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all cursor-pointer text-sm"
            >
              Fazer Login no Sistema
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} Muniz Metalúrgica LTDA • Caldeiraria, Usinagem e Estruturas Metálicas</p>
          <p className="text-slate-600">Sistema em conformidade com as regras de férias da CLT</p>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        users={users}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      {currentUser && currentUser.role === 'employee' && (
        <VacationRequestModal
          isOpen={isRequestModalOpen}
          currentUser={currentUser}
          existingRequests={requests}
          onClose={() => setIsRequestModalOpen(false)}
          onSubmit={handleCreateRequest}
        />
      )}

      <ApprovalModal
        request={selectedRequestForApproval}
        allRequests={requests}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedRequestForApproval(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <PrintReceiptModal
        request={selectedRequestForReceipt}
        isOpen={isPrintReceiptOpen}
        onClose={() => {
          setIsPrintReceiptOpen(false);
          setSelectedRequestForReceipt(null);
        }}
      />

      <AddEmployeeModal
        isOpen={isAddEmployeeOpen}
        onClose={() => setIsAddEmployeeOpen(false)}
        onAddEmployee={handleAddEmployee}
      />

      {/* Secret Owner Access Modal (triggered by clicking "Muniz Metalúrgica") */}
      <SecretOwnerModal
        isOpen={isSecretOwnerModalOpen}
        onClose={() => setIsSecretOwnerModalOpen(false)}
        onOwnerLogin={handleLogin}
        users={users}
      />

      {/* Supabase Connection Modal (URL & API Key) */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSuccess={() => showToast('Configuração do Supabase atualizada com sucesso!')}
      />

    </div>
  );
}
