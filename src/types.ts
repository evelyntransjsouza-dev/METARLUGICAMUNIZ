export type UserRole = 'owner' | 'employee';

export type RequestStatus = 'pending' | 'approved' | 'approved_adjusted' | 'rejected' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email?: string; // Gmail do proprietário ou email de contato
  phone: string;
  password: string;
  role: UserRole;
  department: string;
  jobTitle: string;
  admissionDate: string; // YYYY-MM-DD
  totalVacationDays: number; // typically 30 per cycle
  usedVacationDays: number;
  avatarColor?: string;
  badgeNumber?: string;
}

export interface VacationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeePhone: string;
  department: string;
  jobTitle: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  requestedDays: number;
  
  // O ponto central da solicitação do cliente:
  // "quantos dias solicitados eu irei acordar"
  agreedDays: number | null;
  agreedStartDate?: string;
  agreedEndDate?: string;
  
  status: RequestStatus;
  sellVacationAllowance: boolean; // Abono pecuniário (venda de 10 dias)
  isInstallment: boolean; // Férias fracionadas
  installmentPeriod?: '1º Período' | '2º Período' | '3º Período' | 'Período Único';
  
  employeeNotes: string;
  ownerNotes: string; // Mensagem/Justificativa do proprietário
  createdAt: string; // ISO date string
  reviewedAt?: string; // ISO date string
}

export interface DepartmentInfo {
  id: string;
  name: string;
  iconName: string;
  description: string;
}
