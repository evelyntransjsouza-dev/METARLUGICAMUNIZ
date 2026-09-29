import React, { useState } from 'react';
import { VacationRequest } from '../types';
import { 
  formatDateBR, 
  calculateEndDate, 
  getMonthName 
} from '../utils/dateUtils';
import confetti from 'canvas-confetti';
import { 
  X, 
  ShieldCheck, 
  Calendar, 
  CheckCircle, 
  Sliders, 
  XCircle, 
  MessageSquare, 
  Phone, 
  AlertTriangle, 
  Check, 
  Clock, 
  Sparkles
} from 'lucide-react';

interface ApprovalModalProps {
  request: VacationRequest | null;
  allRequests: VacationRequest[];
  isOpen: boolean;
  onClose: () => void;
  onApprove: (
    requestId: string, 
    agreedDays: number, 
    ownerNotes: string, 
    isFullApproval: boolean,
    agreedEndDate: string
  ) => void;
  onReject: (requestId: string, ownerNotes: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  request,
  allRequests,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  if (!isOpen || !request) return null;

  // Decision state: 'full' | 'negotiate' | 'reject'
  const [decisionMode, setDecisionMode] = useState<'full' | 'negotiate' | 'reject'>('full');
  
  // Custom agreed days: defaults to requestedDays or 20 if requested was 30
  const [agreedDays, setAgreedDays] = useState<number>(request.requestedDays);
  const [ownerNotes, setOwnerNotes] = useState('');
  const [error, setError] = useState('');

  // Calculate new agreed end date if negotiated
  const calculatedAgreedEndDate = calculateEndDate(request.startDate, agreedDays);

  // Return to work date
  const returnToWorkDate = calculatedAgreedEndDate ? (() => {
    const d = new Date(calculatedAgreedEndDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })() : '';

  // Same sector overlap check
  const sectorCollisions = allRequests.filter(r => 
    r.id !== request.id &&
    r.department === request.department &&
    (r.status === 'approved' || r.status === 'approved_adjusted') &&
    !(new Date(r.endDate) < new Date(request.startDate) || new Date(r.startDate) > new Date(request.endDate))
  );

  const handleDecision = () => {
    setError('');

    if (decisionMode === 'reject') {
      if (!ownerNotes.trim()) {
        setError('Por favor, informe a justificativa da recusa ou sugestão de novo mês para o colaborador.');
        return;
      }
      onReject(request.id, ownerNotes.trim());
      onClose();
      return;
    }

    if (agreedDays <= 0 || agreedDays > request.requestedDays) {
      setError(`A quantidade de dias acordados deve ser entre 1 e ${request.requestedDays} dias.`);
      return;
    }

    // Launch confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    const isFull = decisionMode === 'full' || agreedDays === request.requestedDays;
    
    // Default helpful note if empty
    const finalNotes = ownerNotes.trim() || (isFull 
      ? `Aprovado integralmente com ${agreedDays} dias conforme solicitado!` 
      : `Acordo firmado para ${agreedDays} dias neste período. Saldo restante disponível para outro momento.`);

    onApprove(
      request.id,
      agreedDays,
      finalNotes,
      isFull,
      calculatedAgreedEndDate
    );
    onClose();
  };

  const monthName = getMonthName(request.startDate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-slate-950 p-5 sm:p-6 text-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shadow-lg border border-amber-400/40">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-black uppercase tracking-widest bg-slate-950/80 text-amber-300 px-2 py-0.5 rounded">
                  Decisão da Diretoria
                </span>
                <span className="text-xs text-amber-950 font-bold">
                  Sr. Carlos Muniz
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-950 tracking-wide mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Análise & Acordo de Férias
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-900 hover:text-black hover:bg-amber-500/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {error && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Employee Request Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-base font-bold text-slate-100">{request.employeeName}</span>
                <p className="text-xs text-slate-400">
                  {request.jobTitle} • {request.department}
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>{request.employeePhone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Mês Escolhido</span>
                <span className="text-slate-200 font-semibold text-sm">{monthName}</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Dias Solicitados</span>
                <span className="text-amber-400 font-bold text-sm">{request.requestedDays} dias</span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Período Solicitado</span>
                <span className="text-slate-200 font-semibold text-[11px]">
                  {formatDateBR(request.startDate)} a {formatDateBR(request.endDate)}
                </span>
              </div>

              <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Abono / Venda 10d</span>
                <span className="text-slate-300 font-semibold">
                  {request.sellVacationAllowance ? 'Sim (10 dias)' : 'Não'}
                </span>
              </div>
            </div>

            {request.employeeNotes && (
              <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold block mb-0.5">Recado do Colaborador:</span>
                <p className="text-slate-300 italic">"{request.employeeNotes}"</p>
              </div>
            )}
          </div>

          {/* Sector Conflict Alert */}
          {sectorCollisions.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold">Atenção à Produção na Metalúrgica:</span>
                <p className="mt-0.5 text-slate-300">
                  {sectorCollisions.map(s => `${s.employeeName} (${formatDateBR(s.agreedStartDate || s.startDate)} a ${formatDateBR(s.agreedEndDate || s.endDate)})`).join(', ')} já tem férias aprovadas no mesmo período neste setor. Acordar menos dias pode manter o turno operando!
                </p>
              </div>
            </div>
          )}

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Qual a sua decisão para esta solicitação?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Option 1: Full Approval */}
              <button
                type="button"
                onClick={() => {
                  setDecisionMode('full');
                  setAgreedDays(request.requestedDays);
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  decisionMode === 'full'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-400 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircle className={`w-4 h-4 ${decisionMode === 'full' ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold">Aprovar Integral</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Liberar todos os {request.requestedDays} dias solicitados.
                </p>
              </button>

              {/* Option 2: Negotiate Agreed Days */}
              <button
                type="button"
                onClick={() => {
                  setDecisionMode('negotiate');
                  if (agreedDays === request.requestedDays && request.requestedDays > 15) {
                    setAgreedDays(20);
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  decisionMode === 'negotiate'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-400 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Sliders className={`w-4 h-4 ${decisionMode === 'negotiate' ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold">Acordar Dias</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Definir quantidade acordada (ex: 20 dias).
                </p>
              </button>

              {/* Option 3: Reject */}
              <button
                type="button"
                onClick={() => setDecisionMode('reject')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  decisionMode === 'reject'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 ring-1 ring-rose-400 shadow-lg'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <XCircle className={`w-4 h-4 ${decisionMode === 'reject' ? 'text-rose-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold">Recusar Período</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pedir para remarcar outro mês.
                </p>
              </button>

            </div>
          </div>

          {/* Negotiate Days Slider & Inputs */}
          {decisionMode === 'negotiate' && (
            <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/40 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center">
                  <Sliders className="w-4 h-4 mr-1.5 text-amber-400" />
                  Quantos dias solicitados você irá acordar?
                </span>
                <span className="text-lg font-black text-amber-400 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  {agreedDays} dias
                </span>
              </div>

              {/* Range Slider */}
              <input
                type="range"
                min={5}
                max={request.requestedDays}
                step={1}
                value={agreedDays}
                onChange={(e) => setAgreedDays(Number(e.target.value))}
                className="w-full accent-amber-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Quick shortcut chips */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400 text-[11px]">Atalhos rápidos:</span>
                {[10, 15, 20, 25].filter(d => d <= request.requestedDays).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAgreedDays(d)}
                    className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors ${
                      agreedDays === d
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {d} dias
                  </button>
                ))}
              </div>

              {/* Agreed impact details */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Novo período acordado:</span>
                  <div className="font-bold text-amber-300">
                    {formatDateBR(request.startDate)} até {formatDateBR(calculatedAgreedEndDate)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Retorno do colaborador à metalúrgica:</span>
                  <div className="font-bold text-emerald-400">
                    {formatDateBR(returnToWorkDate)}
                  </div>
                </div>
                <div className="sm:col-span-2 text-[11px] text-slate-400">
                  * O colaborador terá ainda <strong className="text-slate-200">{request.requestedDays - agreedDays} dias</strong> de saldo restante para tirar em outra oportunidade.
                </div>
              </div>
            </div>
          )}

          {/* Feedback Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center">
                <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                {decisionMode === 'reject' 
                  ? 'Motivo da Recusa / Sugestão de Mês (Obrigatório)' 
                  : 'Mensagem / Recado do Proprietário para o Colaborador (Exibido no painel dele)'}
              </span>
            </label>
            <textarea
              rows={2}
              required={decisionMode === 'reject'}
              placeholder={
                decisionMode === 'reject'
                  ? 'Ex: Em agosto teremos a entrega da estrutura metálica da usina. Por favor reagende para setembro ou outubro.'
                  : decisionMode === 'negotiate'
                  ? 'Ex: Acordo feito para 20 dias agora para mantermos a usinagem rodando. Os 10 dias restantes você pode tirar em dezembro.'
                  : 'Ex: Aprovado! Desejo um excelente descanso para você e sua família.'
              }
              value={ownerNotes}
              onChange={(e) => setOwnerNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Footer Decision Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleDecision}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                decisionMode === 'reject'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : decisionMode === 'negotiate'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {decisionMode === 'reject'
                  ? 'Confirmar Recusa'
                  : decisionMode === 'negotiate'
                  ? `Aprovar com Acordo (${agreedDays} Dias)`
                  : 'Aprovar Integralmente'}
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
