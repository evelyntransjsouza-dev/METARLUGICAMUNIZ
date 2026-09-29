import React, { useState } from 'react';
import { User, VacationRequest } from '../types';
import { 
  formatDateBR, 
  getStatusDetails, 
  getMonthName,
  MONTH_NAMES_PT 
} from '../utils/dateUtils';
import { 
  Calendar, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Printer, 
  MessageSquare, 
  ShieldCheck, 
  HelpCircle, 
  TrendingUp, 
  Briefcase, 
  Coins, 
  XCircle, 
  Layers, 
  ChevronRight,
  Info
} from 'lucide-react';

interface EmployeeDashboardProps {
  currentUser: User;
  requests: VacationRequest[];
  onOpenNewRequest: () => void;
  onCancelRequest: (requestId: string) => void;
  onViewReceipt: (request: VacationRequest) => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
  currentUser,
  requests,
  onOpenNewRequest,
  onCancelRequest,
  onViewReceipt
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved' | 'calendar'>('all');

  // Filter requests for current employee
  const myRequests = requests.filter(r => r.employeeId === currentUser.id);

  // Calculations
  const totalDays = currentUser.totalVacationDays || 30;
  
  // Calculate days taken/approved
  const approvedRequests = myRequests.filter(r => r.status === 'approved' || r.status === 'approved_adjusted');
  const usedDays = approvedRequests.reduce((acc, curr) => {
    return acc + (curr.agreedDays ?? curr.requestedDays);
  }, 0);

  // Pending days
  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const pendingDays = pendingRequests.reduce((acc, curr) => acc + curr.requestedDays, 0);

  // Available remaining balance
  const remainingDays = Math.max(0, totalDays - usedDays);

  // Most recent request to highlight
  const latestRequest = myRequests.length > 0 ? myRequests[0] : null;

  // Filtered requests list
  const filteredRequests = myRequests.filter(r => {
    if (filterTab === 'pending') return r.status === 'pending';
    if (filterTab === 'approved') return r.status === 'approved' || r.status === 'approved_adjusted';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Employee Welcome & Profile Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-sky-500/20 border border-sky-400/30">
              {currentUser.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-wide">
                  Painel do Colaborador: <span className="text-amber-400">{currentUser.name}</span>
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  {currentUser.badgeNumber || 'MET-001'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {currentUser.jobTitle} • {currentUser.department}
              </p>
            </div>
          </div>

          {/* Action button to request vacation */}
          <button
            onClick={onOpenNewRequest}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer text-xs uppercase tracking-wider group"
          >
            <PlusCircle className="w-4 h-4 text-slate-950 group-hover:rotate-90 transition-transform duration-300" />
            <span>Solicitar Férias (Dia e Mês)</span>
          </button>
        </div>
      </div>

      {/* Vacation Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Annual Entitlement */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Direito Anual CLT</span>
            <Calendar className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-100">
            {totalDays} <span className="text-xs font-semibold text-slate-400">dias</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Período aquisitivo completo
          </div>
        </div>

        {/* Days Agreed & Approved */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Dias Já Acordados / Gozados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {usedDays} <span className="text-xs font-semibold text-slate-400">dias</span>
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            {approvedRequests.length} período(s) acordado(s)
          </div>
        </div>

        {/* Days in Analysis */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
            <span>Em Análise pelo Patrão</span>
            <Clock className="w-4 h-4 text-sky-400 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400">
            {pendingDays} <span className="text-xs font-semibold text-slate-400">dias</span>
          </div>
          <div className="text-[11px] text-sky-400/80 mt-1">
            {pendingRequests.length} solicitação aguardando
          </div>
        </div>

        {/* Remaining Days Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-amber-950/20 border border-amber-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-2">
            <span>Saldo Restante Livre</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {remainingDays} <span className="text-xs font-semibold text-amber-200/80">dias</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Disponíveis para agendamento
          </div>
        </div>

      </div>

      {/* HIGHLIGHT: Owner Decision Status Banner (Requested in prompt: visualizarem se eu aceitei e quantos dias acordei) */}
      {latestRequest && (
        <div className={`p-5 rounded-2xl border transition-all ${
          latestRequest.status === 'approved' || latestRequest.status === 'approved_adjusted'
            ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
            : latestRequest.status === 'pending'
            ? 'bg-gradient-to-r from-sky-950/40 via-slate-900 to-slate-900 border-sky-500/40 shadow-lg shadow-sky-950/20'
            : 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-lg shadow-rose-950/20'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1 text-amber-400" />
                  Status da Resposta da Chefia (Sr. Carlos Muniz)
                </span>
                
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusDetails(latestRequest.status).badgeBg}`}>
                  {getStatusDetails(latestRequest.status).label}
                </span>
              </div>

              {/* The two direct answers required by user */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* 1. Se eu aceitei */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">O proprietário aceitou sua solicitação?</span>
                  <div className="mt-1 flex items-center space-x-2">
                    {latestRequest.status === 'approved' || latestRequest.status === 'approved_adjusted' ? (
                      <span className="text-sm font-extrabold text-emerald-400 flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
                        SIM! FÉRIAS ACEITAS
                      </span>
                    ) : latestRequest.status === 'pending' ? (
                      <span className="text-sm font-extrabold text-sky-400 flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-sky-400" />
                        EM ANÁLISE PELO SR. MUNIZ
                      </span>
                    ) : (
                      <span className="text-sm font-extrabold text-rose-400 flex items-center">
                        <XCircle className="w-4 h-4 mr-1 text-rose-400" />
                        NÃO ACEITO NESTE PERÍODO
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Quantos dias solicitados eu irei acordar */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400 block font-medium">Quantos dias foram acordados pelo proprietário?</span>
                  <div className="mt-1">
                    {latestRequest.status === 'approved_adjusted' ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base font-black text-amber-400">
                          {latestRequest.agreedDays} dias acordados
                        </span>
                        <span className="text-xs text-slate-400">
                          (você solicitou {latestRequest.requestedDays} dias)
                        </span>
                      </div>
                    ) : latestRequest.status === 'approved' ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base font-black text-emerald-400">
                          {latestRequest.agreedDays ?? latestRequest.requestedDays} dias acordados
                        </span>
                        <span className="text-xs text-slate-400">
                          (integral conforme solicitado)
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-slate-400">
                        {latestRequest.status === 'pending' ? 'Aguardando acordo da quantidade de dias' : 'Nenhum dia acordado neste pedido'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner note / feedback message */}
              {latestRequest.ownerNotes && (
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300">Recado do Sr. Muniz:</strong>
                    <p className="mt-0.5 text-slate-200 italic">"{latestRequest.ownerNotes}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Print receipt button if approved */}
            {(latestRequest.status === 'approved' || latestRequest.status === 'approved_adjusted') && (
              <button
                onClick={() => onViewReceipt(latestRequest)}
                className="shrink-0 flex items-center space-x-2 bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Ver Comprovante Oficial</span>
              </button>
            )}

          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <div className="space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterTab === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todas as Solicitações ({myRequests.length})
            </button>
            <button
              onClick={() => setFilterTab('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterTab === 'approved'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Aprovadas & Acordadas ({approvedRequests.length})
            </button>
            <button
              onClick={() => setFilterTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterTab === 'pending'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Em Análise ({pendingRequests.length})
            </button>
            <button
              onClick={() => setFilterTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filterTab === 'calendar'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visão Anual
            </button>
          </div>

          <span className="text-xs text-slate-500 hidden sm:inline">
            Muniz Metalúrgica • RH & Férias
          </span>
        </div>

        {/* Tab 1: Requests List */}
        {filterTab !== 'calendar' ? (
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-slate-300">Nenhuma solicitação encontrada</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Você ainda não enviou nenhum pedido de férias com este filtro. Escolha o dia e o mês desejado para enviar ao proprietário.
                </p>
                <button
                  onClick={onOpenNewRequest}
                  className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Fazer Solicitação de Férias</span>
                </button>
              </div>
            ) : (
              filteredRequests.map((req) => {
                const statusInfo = getStatusDetails(req.status);
                const reqMonth = getMonthName(req.startDate);
                const finalStart = req.agreedStartDate || req.startDate;
                const finalEnd = req.agreedEndDate || req.endDate;
                const agreedCount = req.agreedDays ?? req.requestedDays;

                return (
                  <div
                    key={req.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 transition-all shadow-sm space-y-4"
                  >
                    {/* Top Row */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs">
                          {reqMonth.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-bold text-slate-100">
                              Férias em {reqMonth}
                            </h4>
                            <span className="text-xs text-slate-400">
                              ({req.installmentPeriod || 'Período Único'})
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Solicitado em {formatDateBR(req.createdAt.split('T')[0])}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1.5 ${statusInfo.badgeBg}`}>
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle: Days and Agreement Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Você Solicitou:</span>
                        <div className="text-sm font-bold text-slate-200 mt-0.5">
                          {req.requestedDays} dias corridos
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {formatDateBR(req.startDate)} até {formatDateBR(req.endDate)}
                        </div>
                      </div>

                      <div className="border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-3">
                        <span className="text-slate-400 block text-[11px]">Acordo do Patrão (Sr. Muniz):</span>
                        {req.status === 'approved_adjusted' ? (
                          <>
                            <div className="text-sm font-black text-amber-400 mt-0.5">
                              {req.agreedDays} dias acordados
                            </div>
                            <div className="text-[11px] text-amber-300/80">
                              De {formatDateBR(finalStart)} até {formatDateBR(finalEnd)}
                            </div>
                          </>
                        ) : req.status === 'approved' ? (
                          <>
                            <div className="text-sm font-black text-emerald-400 mt-0.5">
                              {agreedCount} dias aprovados
                            </div>
                            <div className="text-[11px] text-emerald-300/80">
                              Integral conforme pedido
                            </div>
                          </>
                        ) : req.status === 'pending' ? (
                          <div className="text-xs text-sky-400 italic mt-0.5">
                            Aguardando o Sr. Muniz analisar e acordar os dias...
                          </div>
                        ) : (
                          <div className="text-xs text-rose-400 italic mt-0.5">
                            Reagendamento necessário
                          </div>
                        )}
                      </div>

                      <div className="border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2 sm:pt-0 sm:pl-3">
                        <span className="text-slate-400 block text-[11px]">Abono / Retorno:</span>
                        <div className="text-xs text-slate-300 mt-0.5 font-medium">
                          {req.sellVacationAllowance ? 'Venda de 10 dias (Abono)' : 'Sem venda de dias'}
                        </div>
                        {(req.status === 'approved' || req.status === 'approved_adjusted') && (
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Retorno ao trabalho: {formatDateBR(finalEnd)} + 1 dia útil
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Owner feedback or note */}
                    {req.ownerNotes && (
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center space-x-1.5 text-amber-400 font-semibold mb-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Observação do Proprietário:</span>
                        </div>
                        <p className="text-slate-300 italic pl-5">"{req.ownerNotes}"</p>
                      </div>
                    )}

                    {/* Employee note */}
                    {req.employeeNotes && (
                      <div className="text-xs text-slate-400 flex items-start space-x-2">
                        <span className="font-semibold text-slate-400">Sua observação:</span>
                        <span className="text-slate-400 italic">"{req.employeeNotes}"</span>
                      </div>
                    )}

                    {/* Actions Row */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                      <div>
                        {req.status === 'pending' && (
                          <button
                            onClick={() => onCancelRequest(req.id)}
                            className="text-rose-400 hover:text-rose-300 font-medium transition-colors cursor-pointer"
                          >
                            Cancelar esta solicitação
                          </button>
                        )}
                      </div>

                      <div>
                        {(req.status === 'approved' || req.status === 'approved_adjusted') && (
                          <button
                            onClick={() => onViewReceipt(req)}
                            className="flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir Comprovante</span>
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Tab 2: Monthly Calendar Grid Preview */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  Planejamento Anual dos Meses (2026 / 2027)
                </h3>
                <p className="text-xs text-slate-400">
                  Veja a distribuição das suas férias ao longo do ano na Muniz Metalúrgica
                </p>
              </div>
              <button
                onClick={onOpenNewRequest}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                + Marcar Mês
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
              {MONTH_NAMES_PT.map((monthName, idx) => {
                const monthNumber = String(idx + 1).padStart(2, '0');
                
                // Find if employee has vacation in this month
                const monthRequests = myRequests.filter(r => {
                  const [year, m] = r.startDate.split('-');
                  return m === monthNumber;
                });

                const hasApproved = monthRequests.some(r => r.status === 'approved' || r.status === 'approved_adjusted');
                const hasPending = monthRequests.some(r => r.status === 'pending');

                return (
                  <div
                    key={monthName}
                    className={`p-3.5 rounded-xl border transition-all ${
                      hasApproved
                        ? 'bg-emerald-500/15 border-emerald-500/40'
                        : hasPending
                        ? 'bg-sky-500/15 border-sky-500/40'
                        : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">{monthName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{idx + 1}º Mês</span>
                    </div>

                    {hasApproved ? (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-emerald-400 flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          <span>Férias Aprovadas!</span>
                        </div>
                        {monthRequests.map(r => (
                          <div key={r.id} className="text-[10px] text-slate-300">
                            {r.agreedDays ?? r.requestedDays} dias ({formatDateBR(r.agreedStartDate || r.startDate)})
                          </div>
                        ))}
                      </div>
                    ) : hasPending ? (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-sky-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>Solicitação em análise</span>
                        </div>
                        {monthRequests.map(r => (
                          <div key={r.id} className="text-[10px] text-slate-300">
                            {r.requestedDays} dias solicitados
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2">
                        <span>Disponível</span>
                        <button
                          onClick={onOpenNewRequest}
                          className="text-amber-400 hover:text-amber-300 text-[10px] font-semibold"
                        >
                          Escolher
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
