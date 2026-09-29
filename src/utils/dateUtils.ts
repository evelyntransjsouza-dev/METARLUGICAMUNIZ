export const MONTH_NAMES_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

/**
 * Calculates number of calendar days between start and end (inclusive)
 */
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

/**
 * Calculates end date given start date and duration in days (inclusive)
 */
export function calculateEndDate(startDateStr: string, days: number): string {
  if (!startDateStr || days <= 0) return '';
  const date = new Date(startDateStr + 'T00:00:00');
  date.setDate(date.getDate() + (days - 1));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns formatted date in Brazilian locale (DD/MM/YYYY)
 */
export function formatDateBR(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr || '-';
  }
}

/**
 * Formats a phone number to (XX) XXXXX-XXXX
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

/**
 * Gets month name from date string YYYY-MM-DD
 */
export function getMonthName(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const monthIdx = parseInt(parts[1], 10) - 1;
  return MONTH_NAMES_PT[monthIdx] || '';
}

/**
 * Returns a human friendly status description and colors
 */
export function getStatusDetails(status: string) {
  switch (status) {
    case 'approved':
      return {
        label: 'Aprovado Integralmente',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
        dotColor: 'bg-emerald-400',
        textColor: 'text-emerald-400',
        description: 'Solicitação aceita pelo proprietário'
      };
    case 'approved_adjusted':
      return {
        label: 'Aprovado com Acordo',
        badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
        dotColor: 'bg-amber-400',
        textColor: 'text-amber-400',
        description: 'Dias acordados com o proprietário'
      };
    case 'pending':
      return {
        label: 'Em Análise',
        badgeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-400',
        dotColor: 'bg-sky-400 animate-pulse',
        textColor: 'text-sky-400',
        description: 'Aguardando decisão da chefia'
      };
    case 'rejected':
      return {
        label: 'Recusado / Ajuste Necessário',
        badgeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-400',
        dotColor: 'bg-rose-400',
        textColor: 'text-rose-400',
        description: 'Não aprovado para o período'
      };
    case 'cancelled':
      return {
        label: 'Cancelado',
        badgeBg: 'bg-slate-700/50 border-slate-600 text-slate-400',
        dotColor: 'bg-slate-400',
        textColor: 'text-slate-400',
        description: 'Cancelado pelo solicitante'
      };
    default:
      return {
        label: status,
        badgeBg: 'bg-slate-800 text-slate-300',
        dotColor: 'bg-slate-400',
        textColor: 'text-slate-300',
        description: ''
      };
  }
}
