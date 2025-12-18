import React from 'react';
import { Case, CaseStatus } from '../types';
import { Briefcase, Scale, Bell, ChevronRight } from './Icons';

interface DashboardHomeProps {
  cases: Case[];
  onNavigate: (view: 'cases') => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ cases, onNavigate }) => {
  const activeCases = cases.filter(c => c.status === CaseStatus.ACTIVE || c.status === CaseStatus.URGENT).length;
  const urgentCases = cases.filter(c => c.status === CaseStatus.URGENT).length;
  const pendingCases = cases.filter(c => c.status === CaseStatus.PENDING).length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-navy-900">Bom dia, Dr(a). Silva</h2>
            <p className="text-navy-500 mt-1">Aqui está o resumo do seu escritório hoje.</p>
        </div>
        <div className="text-right hidden sm:block">
            <p className="text-sm text-navy-400">Quarta-feira, 25 de Maio</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
              <Scale />
            </div>
            <span className="text-sm font-medium text-navy-400">Total Ativos</span>
          </div>
          <div className="text-3xl font-bold text-navy-900">{activeCases}</div>
          <div className="text-sm text-green-600 mt-2 flex items-center">
            <span className="bg-green-100 px-2 py-0.5 rounded text-xs font-semibold mr-2">+2</span>
            novos esta semana
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-amber-50 p-3 rounded-lg text-amber-600">
              <Bell />
            </div>
            <span className="text-sm font-medium text-navy-400">Prazos Urgentes</span>
          </div>
          <div className="text-3xl font-bold text-navy-900">{urgentCases}</div>
          <div className="text-sm text-amber-600 mt-2">
            Ação necessária hoje
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-navy-100 transition hover:shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
              <Briefcase />
            </div>
            <span className="text-sm font-medium text-navy-400">Audiências</span>
          </div>
          <div className="text-3xl font-bold text-navy-900">3</div>
          <div className="text-sm text-navy-500 mt-2">
            Próxima às 14:00
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
        <div className="p-6 border-b border-navy-50 flex justify-between items-center">
          <h3 className="text-lg font-bold text-navy-800">Processos Recentes</h3>
          <button 
            onClick={() => onNavigate('cases')}
            className="text-sm text-gold-600 hover:text-gold-500 font-medium flex items-center gap-1"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy-600">
            <thead className="bg-navy-50 text-navy-800 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-4">Processo</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {cases.slice(0, 4).map((c) => (
                <tr key={c.id} className="hover:bg-navy-50/50 transition">
                  <td className="px-6 py-4 font-medium text-navy-900">{c.number}</td>
                  <td className="px-6 py-4">{c.client}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${c.status === CaseStatus.URGENT ? 'bg-red-100 text-red-700' : 
                        c.status === CaseStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }
                    `}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-navy-400 hover:text-navy-700 font-medium">Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};