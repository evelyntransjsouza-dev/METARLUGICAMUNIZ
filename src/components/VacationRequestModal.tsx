import React, { useState } from 'react';
import { User, VacationRequest } from '../types';
import { 
  calculateDaysBetween, 
  calculateEndDate, 
  formatDateBR, 
  MONTH_NAMES_PT 
} from '../utils/dateUtils';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  Send, 
  Sparkles,
  HelpCircle,
  Layers
} from 'lucide-react';

interface VacationRequestModalProps {
  isOpen: boolean;
  currentUser: User;
  existingRequests: VacationRequest[];
  onClose: () => void;
  onSubmit: (request: Omit<VacationRequest, 'id' | 'createdAt' | 'agreedDays' | 'status' | 'ownerNotes'>) => void;
}

export const VacationRequestModal: React.FC<VacationRequestModalProps> = ({
  isOpen,
  currentUser,
  existingRequests,
  onClose,
  onSubmit
}) => {
  // Current date setup
  const today = new Date();
  const defaultYear = today.getFullYear();
  // Default to next month for good planning
  const nextMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 15);
  const defaultStartDate = nextMonthDate.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [customEndDate, setCustomEndDate] = useState<string>(calculateEndDate(defaultStartDate, 30));
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [sellVacationAllowance, setSellVacationAllowance] = useState(false);
  const [installmentPeriod, setInstallmentPeriod] = useState<'1º Período' | '2º Período' | '3º Período' | 'Período Único'>('Período Único');
  const [employeeNotes, setEmployeeNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Active days calculation
  const totalDays = useCustomDates 
    ? calculateDaysBetween(startDate, customEndDate)
    : selectedDuration;

  const calculatedEnd = useCustomDates 
    ? customEndDate 
    : calculateEndDate(startDate, selectedDuration);

  // Return to work date
  const returnToWorkDate = calculatedEnd ? (() => {
    const end = new Date(calculatedEnd + 'T00:00:00');
    end.setDate(end.getDate() + 1);
    return end.toISOString().split('T')[0];
  })() : '';

  // Extract selected month name
  const startMonthIndex = startDate ? new Date(startDate + 'T00:00:00').getMonth() : today.getMonth();
  const selectedMonthName = MONTH_NAMES_PT[startMonthIndex];

  // Balance calculations
  const remainingDays = currentUser.totalVacationDays - currentUser.usedVacationDays;
  const daysAfterRequest = Math.max(0, remainingDays - totalDays - (sellVacationAllowance ? 10 : 0));

  // Sector collision check
  const deptCollisions = existingRequests.filter(req => {
    if (req.employeeId === currentUser.id) return false;
    if (req.department !== currentUser.department) return false;
    if (req.status === 'rejected' || req.status === 'cancelled') return false;
    
    // Check overlap
    const reqStart = new Date(req.startDate + 'T00:00:00').getTime();
    const reqEnd = new Date(req.endDate + 'T00:00:00').getTime();
    const myStart = new Date(startDate + 'T00:00:00').getTime();
    const myEnd = new Date(calculatedEnd + 'T00:00:00').getTime();

    return (myStart <= reqEnd && myEnd >= reqStart);
  });

  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (!useCustomDates) {
      setCustomEndDate(calculateEndDate(newStart, selectedDuration));
    }
  };

  const handleDurationPreset = (days: number) => {
    setSelectedDuration(days);
    setUseCustomDates(false);
    setCustomEndDate(calculateEndDate(startDate, days));
    if (days < 30) {
      setInstallmentPeriod('1º Período');
    } else {
      setInstallmentPeriod('Período Único');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate || !calculatedEnd) {
      setError('Por favor, informe a data inicial e final do período.');
      return;
    }

    if (totalDays <= 0) {
      setError('A data final deve ser igual ou posterior à data inicial.');
      return;
    }

    if (totalDays < 5) {
      setError('Pela legislação trabalhista (CLT), nenhum período de férias pode ser inferior a 5 dias corridos.');
      return;
    }

    if (totalDays > remainingDays) {
      setError(`Você solicitou ${totalDays} dias, mas possui apenas ${remainingDays} dias de saldo disponível.`);
      return;
    }

    onSubmit({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeePhone: currentUser.phone,
      department: currentUser.department,
      jobTitle: currentUser.jobTitle,
      startDate,
      endDate: calculatedEnd,
      requestedDays: totalDays,
      sellVacationAllowance,
      isInstallment: totalDays < 30 || installmentPeriod !== 'Período Único',
      installmentPeriod,
      employeeNotes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>Solicitação de Férias</span>
                <span className="text-xs bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  {currentUser.department}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Escolha o dia e o mês desejado para aprovação do Sr. Muniz
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Balance Status */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400">Saldo Disponível:</span>
              <span className="ml-1.5 font-bold text-emerald-400 text-sm">{remainingDays} dias</span>
            </div>
            <div>
              <span className="text-slate-400">Dias que você está pedindo:</span>
              <span className="ml-1.5 font-bold text-amber-400 text-sm">{totalDays} dias</span>
            </div>
            <div>
              <span className="text-slate-400">Saldo após pedido:</span>
              <span className="ml-1.5 font-bold text-slate-300">{daysAfterRequest} dias</span>
            </div>
          </div>

          {/* 1. Date selection: dia e mês */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center">
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                1. Data de Início das Férias (Dia e Mês Desejado)
              </span>
              <span className="text-amber-400 font-semibold text-xs lowercase">
                Mês escolhido: {selectedMonthName}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Dia de início (primeiro dia de descanso):
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Data final do período:
                </label>
                <input
                  type="date"
                  required
                  value={calculatedEnd}
                  onChange={(e) => {
                    setUseCustomDates(true);
                    setCustomEndDate(e.target.value);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 2. Quick Duration Buttons */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              2. Duração Solicitada (Atalhos Rápidos)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { days: 30, label: '30 Dias', sub: 'Período Completo' },
                { days: 20, label: '20 Dias', sub: 'Restam 10 dias' },
                { days: 15, label: '15 Dias', sub: 'Metade do período' },
                { days: 10, label: '10 Dias', sub: 'Mínimo com venda' },
              ].map((opt) => {
                const isSelected = !useCustomDates && selectedDuration === opt.days;
                return (
                  <button
                    key={opt.days}
                    type="button"
                    onClick={() => handleDurationPreset(opt.days)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-400'
                        : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-bold">{opt.label}</div>
                    <div className="text-[10px] text-slate-500">{opt.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. CLT Options (Abono & Fracionamento) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* Abono Pecuniário */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center">
                  <Coins className="w-4 h-4 mr-1.5 text-amber-400" />
                  Abono Pecuniário
                </span>
                <input
                  type="checkbox"
                  id="abono"
                  checked={sellVacationAllowance}
                  onChange={(e) => setSellVacationAllowance(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
              </div>
              <label htmlFor="abono" className="text-[11px] text-slate-400 block cursor-pointer">
                Vender 10 dias das férias em dinheiro (convertido em remuneração extra conforme CLT).
              </label>
            </div>

            {/* Fracionamento */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 flex items-center">
                  <Layers className="w-4 h-4 mr-1.5 text-amber-400" />
                  Etapa das Férias
                </span>
              </div>
              <select
                value={installmentPeriod}
                onChange={(e) => setInstallmentPeriod(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Período Único">Período Único (30 dias ou total)</option>
                <option value="1º Período">1º Período (Ex: 15 a 20 dias)</option>
                <option value="2º Período">2º Período (Dias restantes)</option>
                <option value="3º Período">3º Período (Final do ciclo)</option>
              </select>
            </div>
          </div>

          {/* 4. Notes / Reason for Owner */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Observações / Justificativa para o Sr. Muniz (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Viagem em família na semana de recesso escolar, preferência para não coincidir com entrega de peças."
              value={employeeNotes}
              onChange={(e) => setEmployeeNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Sector Conflict Warning if any */}
          {deptCollisions.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div>
                <span className="font-bold">Aviso de Escala do Setor ({currentUser.department}):</span>
                <p className="mt-0.5 text-slate-300">
                  {deptCollisions.map(c => `${c.employeeName} (${formatDateBR(c.startDate)} a ${formatDateBR(c.endDate)})`).join(', ')} já tem solicitação neste mês. O proprietário avaliará a cobertura da metalúrgica antes de acordar os dias.
                </p>
              </div>
            </div>
          )}

          {/* Summary Preview Box */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/5 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-400">Resumo da sua solicitação:</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">
                {totalDays} dias em <span className="text-amber-400">{selectedMonthName}</span> ({formatDateBR(startDate)} até {formatDateBR(calculatedEnd)})
              </div>
              <div className="text-[11px] text-slate-400">
                Retorno programado à metalúrgica: <span className="text-emerald-400 font-semibold">{formatDateBR(returnToWorkDate)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all cursor-pointer uppercase tracking-wider text-xs"
            >
              <Send className="w-4 h-4" />
              <span>Enviar para o Patrão</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
