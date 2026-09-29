import React, { useState } from 'react';
import { User, VacationRequest } from '../types';
import { DEPARTMENTS } from '../data/mockData';
import { 
  formatDateBR, 
  getStatusDetails, 
  getMonthName, 
  MONTH_NAMES_PT 
} from '../utils/dateUtils';
import { 
  ShieldCheck, 
  CheckCircle, 
  Sliders, 
  Calendar, 
  Users, 
  Clock, 
  Printer, 
  UserPlus, 
  MessageSquare, 
  Phone, 
  CheckCircle2,
  CalendarCheck,
  AlertCircle
} from 'lucide-react';

interface OwnerDashboardProps {
  currentUser: User;
  users: User[];
  requests: VacationRequest[];
  onOpenApprovalModal: (request: VacationRequest) => void;
  onOpenAddEmployee: () => void;
  onViewReceipt: (request: VacationRequest) => void;
  onQuickApproveFull: (requestId: string) => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({
  currentUser,
  users,
  requests,
  onOpenApprovalModal,
  onOpenAddEmployee,
  onViewReceipt,
  onQuickApproveFull
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'schedule' | 'employees'>('pending');

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved' || r.status === 'approved_adjusted');
  const employees = users.filter(u => u.role === 'employee');

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      
      {/* Clean Executive Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-100">
                Painel do Proprietário: <span className="text-amber-400">{currentUser.name}</span>
              </h1>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-500/30">
                Diretoria
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentUser.email ? `Acesso Gmail: ${currentUser.email}` : 'Muniz Metalúrgica • Gestão de Férias e Acordo de Dias'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAddEmployee}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Cadastrar Funcionário</span>
          </button>
        </div>
      </div>

      {/* Clean Summary Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Pending Card */}
        <div
          onClick={() => setActiveTab('pending')}
          className={`cursor-pointer p-4 rounded-xl border transition-all ${
            pendingRequests.length > 0
              ? 'bg-amber-500/10 border-amber-500/40 hover:bg-amber-500/15'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Solicitações Pendentes</span>
            <Clock className={`w-4 h-4 ${pendingRequests.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="text-2xl font-black text-slate-100">
            {pendingRequests.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {pendingRequests.length > 0 ? 'Aguardando seu acordo de dias' : 'Nenhuma solicitação pendente'}
          </p>
        </div>

        {/* Approved Card */}
        <div
          onClick={() => setActiveTab('approved')}
          className="cursor-pointer p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Férias Aprovadas / Acordadas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {approvedRequests.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Períodos confirmados na metalúrgica
          </p>
        </div>

        {/* Employees Card */}
        <div
          onClick={() => setActiveTab('employees')}
          className="cursor-pointer p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Quadro de Colaboradores</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">
            {employees.length}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Funcionários ativos nos setores
          </p>
        </div>

      </div>

      {/* Clean Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Solicitações para Aprovar ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'approved'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Férias Acordadas ({approvedRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'schedule'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Escala Mensal</span>
        </button>

        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'employees'
              ? 'bg-amber-500 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Colaboradores ({employees.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING REQUESTS (MAIN FOCUS) */}
      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-200">Nenhuma solicitação pendente</h3>
              <p className="text-xs text-slate-400">
                Todas as solicitações de férias já foram avaliadas pelo proprietário.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => {
                const reqMonth = getMonthName(req.startDate);

                return (
                  <div
                    key={req.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3 hover:border-amber-500/40 transition-colors"
                  >
                    {/* Top Row: Employee details & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-100 text-sm">{req.employeeName}</span>
                          <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-medium">
                            {req.jobTitle}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center space-x-2">
                          <span>Setor: {req.department}</span>
                          <span>•</span>
                          <span>Telefone: {req.employeePhone}</span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20 self-start sm:self-auto">
                        Aguardando sua decisão
                      </div>
                    </div>

                    {/* Middle: Request Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Mês Solicitado</span>
                        <strong className="text-amber-400 text-sm">{reqMonth}</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Dias Pedidos</span>
                        <strong className="text-slate-100 text-sm">{req.requestedDays} dias</strong>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Período Requerido</span>
                        <span className="text-slate-200 font-medium">
                          {formatDateBR(req.startDate)} a {formatDateBR(req.endDate)}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Abono Pecuniário</span>
                        <span className="text-slate-300">
                          {req.sellVacationAllowance ? 'Vender 10 dias' : 'Sem venda'}
                        </span>
                      </div>
                    </div>

                    {/* Employee note if present */}
                    {req.employeeNotes && (
                      <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-slate-400 font-semibold block text-[10px]">Mensagem do Colaborador:</span>
                        <p className="italic mt-0.5">"{req.employeeNotes}"</p>
                      </div>
                    )}

                    {/* Actions: Direct and Clear */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2.5">
                      <button
                        onClick={() => onQuickApproveFull(req.id)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                        title="Aprova integralmente todos os dias pedidos"
                      >
                        Aprovar Todos ({req.requestedDays}d)
                      </button>

                      <button
                        onClick={() => onOpenApprovalModal(req)}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-md"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Definir Acordo de Dias</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: APPROVED & AGREED REQUESTS */}
      {activeTab === 'approved' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100">
              Férias Aprovadas e Dias Acordados
            </h3>
            <span className="text-xs text-slate-400">
              Total: {approvedRequests.length} solicitações
            </span>
          </div>

          {approvedRequests.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">Nenhuma solicitação aprovada ainda.</p>
          ) : (
            <div className="space-y-2.5">
              {approvedRequests.map((req) => {
                const finalDays = req.agreedDays ?? req.requestedDays;
                const isAdjusted = req.status === 'approved_adjusted';

                return (
                  <div
                    key={req.id}
                    className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <strong className="text-slate-100">{req.employeeName}</strong>
                        <span className="text-slate-400">• {req.department}</span>
                        {isAdjusted ? (
                          <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">
                            Acordo: {finalDays} dias (pediu {req.requestedDays}d)
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">
                            Integral: {finalDays} dias
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 mt-1">
                        Período: <strong>{formatDateBR(req.agreedStartDate || req.startDate)} até {formatDateBR(req.agreedEndDate || req.endDate)}</strong>
                      </div>
                      {req.ownerNotes && (
                        <p className="text-slate-400 italic text-[11px] mt-0.5">
                          Recado enviado: "{req.ownerNotes}"
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => onViewReceipt(req)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer self-start sm:self-auto"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Comprovante</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHEDULE MATRIX */}
      {activeTab === 'schedule' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100">
              Escala de Férias da Fábrica (Distribuição por Mês)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consulte quem estará ausente em cada mês para manter os turnos de solda e usinagem cobertos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MONTH_NAMES_PT.map((mName, idx) => {
              const mNum = String(idx + 1).padStart(2, '0');
              const onLeave = approvedRequests.filter(r => {
                const [_, m] = r.startDate.split('-');
                return m === mNum;
              });

              return (
                <div key={mName} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5 mb-2 font-bold text-slate-200">
                    <span>{mName}</span>
                    <span className="text-[10px] text-slate-400">{onLeave.length} funcionário(s)</span>
                  </div>

                  {onLeave.length === 0 ? (
                    <span className="text-[11px] text-slate-500 italic">Sem afastamentos</span>
                  ) : (
                    <div className="space-y-1">
                      {onLeave.map(r => (
                        <div key={r.id} className="text-[11px] text-amber-300">
                          • {r.employeeName} ({r.agreedDays ?? r.requestedDays}d)
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100">
              Colaboradores da Metalúrgica
            </h3>
            <button
              onClick={onOpenAddEmployee}
              className="text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              + Adicionar Novo
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {employees.map(emp => {
              const empApproved = approvedRequests.filter(r => r.employeeId === emp.id);
              const daysUsed = empApproved.reduce((acc, c) => acc + (c.agreedDays ?? c.requestedDays), 0);
              const remaining = Math.max(0, emp.totalVacationDays - daysUsed);

              return (
                <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-100">{emp.name}</span>
                    <span className="text-slate-400 block text-[11px]">
                      {emp.jobTitle} • {emp.department} • Tel: {emp.phone}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-400">{remaining} dias livres</span>
                    <span className="text-slate-500 block text-[10px]">de {emp.totalVacationDays}d</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
