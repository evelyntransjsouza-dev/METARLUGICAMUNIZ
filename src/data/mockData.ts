import { User, VacationRequest, DepartmentInfo } from '../types';

export const DEPARTMENTS: DepartmentInfo[] = [
  {
    id: 'solda',
    name: 'Soldagem Industrial (TIG/MIG)',
    iconName: 'Flame',
    description: 'Setor de solda pesada, caldeiraria e união de estruturas'
  },
  {
    id: 'usinagem',
    name: 'Usinagem & Torno CNC',
    iconName: 'Cog',
    description: 'Produção de peças usinadas de alta precisão, fresas e tornos'
  },
  {
    id: 'corte_dobra',
    name: 'Corte & Dobra de Chapas',
    iconName: 'Scissors',
    description: 'Guilhotinas, corte a laser/plasma e prensas dobradeiras'
  },
  {
    id: 'pintura',
    name: 'Pintura & Tratamento de Superfície',
    iconName: 'Paintbrush',
    description: 'Pintura eletrostática a pó e jateamento'
  },
  {
    id: 'manutencao',
    name: 'Manutenção Mecânica & Elétrica',
    iconName: 'Wrench',
    description: 'Prevenção e conserto de maquinários e pontes rolantes'
  },
  {
    id: 'administrativo',
    name: 'Administrativo, PCP & Compras',
    iconName: 'Building2',
    description: 'Controle de produção, compras de matéria-prima e RH'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'owner-1',
    name: 'Carlos Muniz',
    email: 'muniz.metalurgica@gmail.com',
    phone: '(11) 98765-4321',
    password: '1234', // Especificado pelo usuário: acesso proprietario senha 1234
    role: 'owner',
    department: 'Direção Geral & Operações',
    jobTitle: 'Proprietário / Diretor Industrial',
    admissionDate: '2012-03-01',
    totalVacationDays: 30,
    usedVacationDays: 0,
    avatarColor: 'bg-amber-600',
    badgeNumber: 'DIR-001'
  },
  {
    id: 'emp-1',
    name: 'Lucas Silva',
    phone: '(11) 97123-4567',
    password: '123',
    role: 'employee',
    department: 'Soldagem Industrial (TIG/MIG)',
    jobTitle: 'Soldador TIG/MIG Pleno',
    admissionDate: '2023-04-15',
    totalVacationDays: 30,
    usedVacationDays: 0,
    avatarColor: 'bg-blue-600',
    badgeNumber: 'MET-104'
  },
  {
    id: 'emp-2',
    name: 'Marcos Santos',
    phone: '(11) 98234-5678',
    password: '123',
    role: 'employee',
    department: 'Usinagem & Torno CNC',
    jobTitle: 'Operador & Programador CNC',
    admissionDate: '2022-08-10',
    totalVacationDays: 30,
    usedVacationDays: 20,
    avatarColor: 'bg-cyan-600',
    badgeNumber: 'MET-078'
  },
  {
    id: 'emp-3',
    name: 'Mariana Costa',
    phone: '(11) 99345-6789',
    password: '123',
    role: 'employee',
    department: 'Administrativo, PCP & Compras',
    jobTitle: 'Coordenadora de PCP & Suprimentos',
    admissionDate: '2021-01-20',
    totalVacationDays: 30,
    usedVacationDays: 15,
    avatarColor: 'bg-emerald-600',
    badgeNumber: 'MET-042'
  },
  {
    id: 'emp-4',
    name: 'Roberto Oliveira',
    phone: '(11) 96456-7890',
    password: '123',
    role: 'employee',
    department: 'Corte & Dobra de Chapas',
    jobTitle: 'Operador de Prensa Dobradeira',
    admissionDate: '2023-11-05',
    totalVacationDays: 30,
    usedVacationDays: 0,
    avatarColor: 'bg-orange-600',
    badgeNumber: 'MET-129'
  },
  {
    id: 'emp-5',
    name: 'Fernando Pereira',
    phone: '(11) 95567-8901',
    password: '123',
    role: 'employee',
    department: 'Manutenção Mecânica & Elétrica',
    jobTitle: 'Técnico de Manutenção Mecânica',
    admissionDate: '2020-06-18',
    totalVacationDays: 30,
    usedVacationDays: 10,
    avatarColor: 'bg-purple-600',
    badgeNumber: 'MET-035'
  }
];

export const INITIAL_REQUESTS: VacationRequest[] = [
  {
    id: 'req-1',
    employeeId: 'emp-1',
    employeeName: 'Lucas Silva',
    employeePhone: '(11) 97123-4567',
    department: 'Soldagem Industrial (TIG/MIG)',
    jobTitle: 'Soldador TIG/MIG Pleno',
    startDate: '2026-12-14',
    endDate: '2027-01-12',
    requestedDays: 30,
    agreedDays: null, // Pendente de acordo pelo proprietário
    status: 'pending',
    sellVacationAllowance: false,
    isInstallment: false,
    installmentPeriod: 'Período Único',
    employeeNotes: 'Gostaria de tirar o período todo no fim de ano para viagem com a família ao interior.',
    ownerNotes: '',
    createdAt: '2026-09-25T14:30:00Z'
  },
  {
    id: 'req-2',
    employeeId: 'emp-2',
    employeeName: 'Marcos Santos',
    employeePhone: '(11) 98234-5678',
    department: 'Usinagem & Torno CNC',
    jobTitle: 'Operador & Programador CNC',
    startDate: '2026-07-06',
    endDate: '2026-08-04',
    requestedDays: 30,
    agreedDays: 20, // Demonstração direta do requisito do cliente: "quantos dias solicitados eu irei acordar"
    agreedStartDate: '2026-07-06',
    agreedEndDate: '2026-07-25',
    status: 'approved_adjusted',
    sellVacationAllowance: false,
    isInstallment: true,
    installmentPeriod: '1º Período',
    employeeNotes: 'Solicito 30 dias no mês de julho para acompanhar o recesso escolar dos filhos.',
    ownerNotes: 'Acordo firmado: liberado 20 dias em Julho para não desfalcar o torno CNC na entrega de engrenagens do cliente Votorantim. Os 10 dias restantes ficam disponíveis para Novembro.',
    createdAt: '2026-09-18T09:15:00Z',
    reviewedAt: '2026-09-20T16:00:00Z'
  },
  {
    id: 'req-3',
    employeeId: 'emp-3',
    employeeName: 'Mariana Costa',
    employeePhone: '(11) 99345-6789',
    department: 'Administrativo, PCP & Compras',
    jobTitle: 'Coordenadora de PCP & Suprimentos',
    startDate: '2026-10-05',
    endDate: '2026-10-19',
    requestedDays: 15,
    agreedDays: 15,
    agreedStartDate: '2026-10-05',
    agreedEndDate: '2026-10-19',
    status: 'approved',
    sellVacationAllowance: true, // Vendeu 10 dias
    isInstallment: true,
    installmentPeriod: '1º Período',
    employeeNotes: '15 dias de descanso + venda de 10 dias (abono pecuniário) para reforma da casa.',
    ownerNotes: 'Aprovado integralmente! O setor de PCP estará sob cobertura temporária do analista júnior.',
    createdAt: '2026-09-10T11:00:00Z',
    reviewedAt: '2026-09-12T10:30:00Z'
  },
  {
    id: 'req-4',
    employeeId: 'emp-4',
    employeeName: 'Roberto Oliveira',
    employeePhone: '(11) 96456-7890',
    department: 'Corte & Dobra de Chapas',
    jobTitle: 'Operador de Prensa Dobradeira',
    startDate: '2026-08-03',
    endDate: '2026-09-01',
    requestedDays: 30,
    agreedDays: null,
    status: 'rejected',
    sellVacationAllowance: false,
    isInstallment: false,
    employeeNotes: 'Gostaria de tirar no mês de Agosto.',
    ownerNotes: 'Infelizmente Agosto é o pico da safra de tanques metálicos e teremos 3 pedidos grandes. Por favor, reenvie a solicitação para Setembro ou Outubro que liberarei com certeza!',
    createdAt: '2026-09-05T13:40:00Z',
    reviewedAt: '2026-09-07T14:20:00Z'
  }
];
