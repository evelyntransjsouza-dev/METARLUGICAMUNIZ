import React from 'react';
import { VacationRequest, User } from '../types';
import { formatDateBR } from '../utils/dateUtils';
import { X, Printer, Factory, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PrintReceiptModalProps {
  request: VacationRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  request,
  isOpen,
  onClose
}) => {
  if (!isOpen || !request) return null;

  const handlePrint = () => {
    window.print();
  };

  const finalDays = request.agreedDays ?? request.requestedDays;
  const finalStart = request.agreedStartDate || request.startDate;
  const finalEnd = request.agreedEndDate || request.endDate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-300">
        
        {/* Screen Action Bar (hidden in print) */}
        <div className="p-4 bg-slate-100 border-b border-slate-300 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <Factory className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-sm text-slate-800">
              Comprovante Oficial de Concessão de Férias
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-sm" id="printable-vacation-slip">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-wide text-slate-900">
                Muniz Metalúrgica LTDA
              </h2>
              <p className="text-xs text-slate-600">
                CNPJ: 14.892.341/0001-88 • Indústria de Caldeiraria e Usinagem Pesada
              </p>
              <p className="text-xs text-slate-600">
                Rodovia Industrial Muniz, km 12 - Distrito Industrial
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block px-3 py-1 border-2 border-emerald-600 text-emerald-800 font-black rounded uppercase text-xs">
                Férias Aprovadas
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ref. Solicitação #{request.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="text-center py-2">
            <h3 className="text-base font-black uppercase tracking-wider underline text-slate-900">
              Aviso & Concessão de Férias aos Colaboradores
            </h3>
          </div>

          {/* Employee & Agreement Details */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Colaborador:</span>
              <strong className="text-sm text-slate-900">{request.employeeName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Telefone:</span>
              <strong className="text-slate-900">{request.employeePhone}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Setor / Departamento:</span>
              <strong className="text-slate-900">{request.department}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">Função / Cargo:</span>
              <strong className="text-slate-900">{request.jobTitle}</strong>
            </div>
          </div>

          {/* Vacation Breakdown Table */}
          <table className="w-full text-xs border border-slate-300">
            <thead className="bg-slate-200 text-slate-800">
              <tr>
                <th className="p-2.5 text-left border-b border-slate-300">Item Descritivo</th>
                <th className="p-2.5 text-left border-b border-slate-300">Detalhes Acordados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2.5 font-semibold text-slate-700">Dias Solicitados Originalmente:</td>
                <td className="p-2.5 font-bold text-slate-900">{request.requestedDays} dias</td>
              </tr>
              <tr className="bg-amber-50">
                <td className="p-2.5 font-bold text-amber-950">Dias Acordados com o Proprietário:</td>
                <td className="p-2.5 font-black text-amber-950 text-sm">{finalDays} dias</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-700">Período de Gozo das Férias:</td>
                <td className="p-2.5 font-bold text-slate-900">
                  De {formatDateBR(finalStart)} até {formatDateBR(finalEnd)}
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-700">Abono Pecuniário (Venda de 10 dias):</td>
                <td className="p-2.5 text-slate-900">
                  {request.sellVacationAllowance ? 'SIM (10 dias convertidos em remuneração extra)' : 'NÃO'}
                </td>
              </tr>
              {request.ownerNotes && (
                <tr>
                  <td className="p-2.5 font-semibold text-slate-700">Observações da Diretoria:</td>
                  <td className="p-2.5 text-slate-900 italic">"{request.ownerNotes}"</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Legal statement */}
          <p className="text-[11px] text-slate-600 leading-relaxed text-justify">
            Em conformidade com a Consolidação das Leis do Trabalho (CLT), comunicamos que as férias requeridas foram devidamente analisadas, programadas e acordadas pela diretoria da <strong>Muniz Metalúrgica</strong>, cabendo ao colaborador o retorno às suas funções normais no primeiro dia útil subsequente ao término do período acordado.
          </p>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="border-t border-slate-800 pt-2 font-bold text-slate-900">
                {request.employeeName}
              </div>
              <div className="text-[10px] text-slate-500">Assinatura do Colaborador</div>
            </div>

            <div>
              <div className="border-t border-slate-800 pt-2 font-bold text-slate-900">
                Carlos Muniz
              </div>
              <div className="text-[10px] text-slate-500">Diretor / Proprietário - Muniz Metalúrgica</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
