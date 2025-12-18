import React, { useState } from 'react';
import { LayoutDashboard, Briefcase, Users, Bot, FileText, Bell, Search, Scale, LogOut, Gavel } from './components/Icons';
import { DashboardHome } from './components/DashboardHome';
import { Assistant } from './components/Assistant';
import { CaseList } from './components/CaseList';
import { Login } from './components/Login';
import { TJRSQuery } from './components/TJRSQuery';
import { Case, CaseStatus, ViewState } from './types';

// Mock Data
const MOCK_CASES: Case[] = [
  {
    id: '1',
    number: '0001234-56.2024.8.26.0100',
    title: 'Ação de Danos Morais vs. Banco X',
    client: 'Maria Oliveira',
    responsibleLawyer: 'Dr. Silva',
    status: CaseStatus.URGENT,
    lastUpdate: '2024-05-20',
    nextHearing: '25/05/2024 14:00',
    description: 'Processo referente a cobrança indevida.'
  },
  {
    id: '2',
    number: '0054321-12.2023.8.26.0001',
    title: 'Divórcio Consensual',
    client: 'João & Ana Silva',
    responsibleLawyer: 'Dra. Santos',
    status: CaseStatus.ACTIVE,
    lastUpdate: '2024-05-18',
    description: 'Aguardando homologação.'
  },
  {
    id: '3',
    number: '1010101-99.2024.5.02.0000',
    title: 'Reclamação Trabalhista',
    client: 'Carlos Souza',
    responsibleLawyer: 'Dr. Silva',
    status: CaseStatus.PENDING,
    lastUpdate: '2024-05-15',
    description: 'Calculos de liquidação pendentes.'
  },
  {
    id: '4',
    number: '2020202-88.2022.8.13.0000',
    title: 'Inventário Família Santos',
    client: 'Roberto Santos',
    responsibleLawyer: 'Dr. Oliveira',
    status: CaseStatus.ACTIVE,
    lastUpdate: '2024-05-10',
    description: 'Aguardando avaliação de bens.'
  },
  {
    id: '5',
    number: '5050505-11.2021.4.03.0000',
    title: 'Revisão Previdenciária',
    client: 'Lúcia Mendes',
    responsibleLawyer: 'Dra. Santos',
    status: CaseStatus.CLOSED,
    lastUpdate: '2024-04-20',
    description: 'Processo finalizado com êxito.'
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const handleAddCase = (newCaseData: Omit<Case, 'id' | 'lastUpdate'>) => {
    const newCase: Case = {
      id: Math.random().toString(36).substr(2, 9),
      lastUpdate: new Date().toISOString().split('T')[0],
      ...newCaseData
    };
    setCases([newCase, ...cases]);
  };

  const handleUpdateCase = (updatedCase: Case) => {
    setCases(cases.map(c => c.id === updatedCase.id ? { ...updatedCase, lastUpdate: new Date().toISOString().split('T')[0] } : c));
  };

  const handleDeleteCase = (id: string) => {
    setCases(cases.filter(c => c.id !== id));
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome cases={cases} onNavigate={setCurrentView} />;
      case 'assistant':
        return <Assistant />;
      case 'cases':
        return <CaseList 
          cases={cases} 
          onAddCase={handleAddCase} 
          onUpdateCase={handleUpdateCase}
          onDeleteCase={handleDeleteCase}
        />;
      case 'tjrs':
        return <TJRSQuery />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-96 text-navy-400">
                <Scale className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-xl font-medium">Em desenvolvimento</h3>
                <p>Este módulo estará disponível em breve.</p>
            </div>
        );
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewState, icon: React.FC<any>, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group
        ${currentView === view 
          ? 'bg-navy-800 text-white shadow-md' 
          : 'text-navy-300 hover:bg-navy-800/50 hover:text-white'
        }`}
    >
      <Icon className={`w-5 h-5 ${currentView === view ? 'text-gold-500' : 'group-hover:text-gold-500'}`} />
      <span className={`font-medium ${!isSidebarOpen && 'hidden md:hidden'}`}>{label}</span>
    </button>
  );

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} 
          bg-navy-900 min-h-screen fixed left-0 top-0 z-30 transition-all duration-300 flex flex-col shadow-2xl`}
      >
        <div className="h-20 flex items-center justify-center border-b border-navy-800 px-4">
            {isSidebarOpen ? (
                <div className="flex items-center gap-2">
                    <div className="bg-gold-500 p-1.5 rounded-lg">
                        <Scale className="w-6 h-6 text-navy-900" />
                    </div>
                    <span className="text-white text-xl font-serif font-bold tracking-tight">Gustavo <span className="text-gold-500">Rith</span></span>
                </div>
            ) : (
                <div className="bg-gold-500 p-2 rounded-lg cursor-pointer" onClick={() => setIsSidebarOpen(true)}>
                     <Scale className="w-6 h-6 text-navy-900" />
                </div>
            )}
        </div>

        <nav className="flex-1 px-3 py-6 space-y-2">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Visão Geral" />
          <NavItem view="cases" icon={Briefcase} label="Processos" />
          <NavItem view="tjrs" icon={Gavel} label="TJRS" />
          <NavItem view="clients" icon={Users} label="Clientes" />
          <NavItem view="documents" icon={FileText} label="Documentos" />
          
          <div className="pt-6 mt-6 border-t border-navy-800">
             <h4 className={`px-4 text-xs font-semibold text-navy-500 uppercase tracking-wider mb-2 ${!isSidebarOpen && 'hidden'}`}>
                Inteligência
             </h4>
             <NavItem view="assistant" icon={Bot} label="Assistente IA" />
          </div>
        </nav>

        <div className="p-4 border-t border-navy-800 space-y-2">
             <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-400 hover:bg-navy-800 hover:text-red-300 transition group"
             >
                <LogOut className="w-5 h-5" />
                <span className={`font-medium ${!isSidebarOpen && 'hidden md:hidden'}`}>Sair</span>
             </button>

             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-full flex items-center justify-center p-2 rounded-lg bg-navy-800 text-navy-300 hover:text-white transition"
             >
                {isSidebarOpen ? '<< Recolher' : '>>'}
             </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-navy-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm/50">
          <h1 className="text-2xl font-serif font-bold text-navy-900 capitalize">
            {currentView === 'assistant' ? 'Assistente Jurídico' : 
             currentView === 'cases' ? 'Gestão de Processos' : 
             currentView === 'dashboard' ? 'Visão Geral' : 
             currentView === 'tjrs' ? 'Consulta Processual TJRS' :
             currentView}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
                <input 
                    type="text" 
                    placeholder="Pesquisar..." 
                    className="pl-10 pr-4 py-2 rounded-full bg-slate-100 border-none focus:ring-2 focus:ring-navy-200 text-sm w-64 text-navy-800"
                />
                <Search className="w-4 h-4 text-navy-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            
            <button className="relative p-2 text-navy-600 hover:bg-slate-100 rounded-full transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold border border-navy-200 cursor-pointer" title="Sair" onClick={handleLogout}>
                DR
            </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}