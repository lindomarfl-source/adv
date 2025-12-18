import React, { useState, useEffect, useMemo } from 'react';
import { Case, CaseStatus } from '../types';
import { Search, Plus, Edit, Trash, ChevronLeft, ChevronRight } from './Icons';

interface CaseListProps {
  cases: Case[];
  onAddCase: (caseData: Omit<Case, 'id' | 'lastUpdate'>) => void;
  onUpdateCase: (caseData: Case) => void;
  onDeleteCase: (id: string) => void;
}

const ITEMS_PER_PAGE = 5;

export const CaseList: React.FC<CaseListProps> = ({ cases, onAddCase, onUpdateCase, onDeleteCase }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [caseToDeleteId, setCaseToDeleteId] = useState<string | null>(null);

  // Search and Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos os Status');
  const [lawyerFilter, setLawyerFilter] = useState('Todos os Advogados');
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    number: '',
    title: '',
    client: '',
    responsibleLawyer: '',
    status: CaseStatus.ACTIVE,
    nextHearing: '',
    description: ''
  });

  // Unique Lawyers Logic
  const uniqueLawyers = useMemo(() => {
    const lawyers = new Set(cases.map(c => c.responsibleLawyer).filter(Boolean));
    return Array.from(lawyers);
  }, [cases]);

  // Filter Logic
  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = 
        c.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.client.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'Todos os Status' || c.status === statusFilter;
      const matchesLawyer = lawyerFilter === 'Todos os Advogados' || c.responsibleLawyer === lawyerFilter;

      return matchesSearch && matchesStatus && matchesLawyer;
    });
  }, [cases, searchTerm, statusFilter, lawyerFilter]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentCases = filteredCases.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, lawyerFilter]);

  const handleOpenModal = (caseItem?: Case) => {
    if (caseItem) {
        setEditingId(caseItem.id);
        setFormData({
            number: caseItem.number,
            title: caseItem.title,
            client: caseItem.client,
            responsibleLawyer: caseItem.responsibleLawyer || '',
            status: caseItem.status,
            nextHearing: caseItem.nextHearing || '',
            description: caseItem.description
        });
    } else {
        setEditingId(null);
        setFormData({
            number: '',
            title: '',
            client: '',
            responsibleLawyer: '',
            status: CaseStatus.ACTIVE,
            nextHearing: '',
            description: ''
        });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCaseToDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (caseToDeleteId) {
        onDeleteCase(caseToDeleteId);
        setIsDeleteModalOpen(false);
        setCaseToDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCaseToDeleteId(null);
  };

  const handleEditClick = (caseItem: Case, e: React.MouseEvent) => {
      e.stopPropagation();
      handleOpenModal(caseItem);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
        // Update existing case
        const updatedCase: Case = {
            id: editingId,
            ...formData,
            status: formData.status as CaseStatus,
            lastUpdate: new Date().toISOString() // Placeholder, updated in App
        };
        onUpdateCase(updatedCase);
    } else {
        // Add new case
        onAddCase({
            ...formData,
            status: formData.status as CaseStatus
        });
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Processos</h2>
          <p className="text-navy-500 text-sm">Gerencie todos os seus casos em andamento.</p>
        </div>
        <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-gold-600 hover:bg-gold-500 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Processo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-navy-100 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por número, cliente ou título..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                />
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
                {/* Lawyer Filter */}
                 <select 
                    value={lawyerFilter}
                    onChange={(e) => setLawyerFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-navy-200 rounded-lg text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                    <option>Todos os Advogados</option>
                    {uniqueLawyers.map(lawyer => (
                        <option key={lawyer} value={lawyer as string}>{lawyer}</option>
                    ))}
                </select>

                {/* Status Filter */}
                <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-navy-200 rounded-lg text-sm text-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                    <option>Todos os Status</option>
                    <option>{CaseStatus.ACTIVE}</option>
                    <option>{CaseStatus.URGENT}</option>
                    <option>{CaseStatus.PENDING}</option>
                    <option>{CaseStatus.CLOSED}</option>
                </select>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-navy-600">
            <thead className="bg-navy-50 text-navy-800 uppercase font-medium text-xs">
              <tr>
                <th className="px-6 py-4">Nº Processo</th>
                <th className="px-6 py-4">Título</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Resp.</th>
                <th className="px-6 py-4">Próx. Audiência</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-50">
              {currentCases.length > 0 ? (
                currentCases.map((c) => (
                    <tr key={c.id} className="hover:bg-navy-50/50 transition cursor-pointer group">
                      <td className="px-6 py-4 font-mono text-navy-500">{c.number}</td>
                      <td className="px-6 py-4 font-medium text-navy-900">{c.title}</td>
                      <td className="px-6 py-4">{c.client}</td>
                      <td className="px-6 py-4 text-xs font-medium text-navy-600">{c.responsibleLawyer || '-'}</td>
                      <td className="px-6 py-4">
                        {c.nextHearing ? (
                            <span className="text-orange-600 font-medium">{c.nextHearing}</span>
                        ) : (
                            <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${c.status === CaseStatus.URGENT ? 'bg-red-100 text-red-700' : 
                            c.status === CaseStatus.ACTIVE ? 'bg-green-100 text-green-700' :
                            c.status === CaseStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }
                        `}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => handleEditClick(c, e)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Editar"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={(e) => handleDeleteClick(c.id, e)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Excluir"
                            >
                                <Trash className="w-4 h-4" />
                            </button>
                        </div>
                      </td>
                    </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-navy-400">
                        Nenhum processo encontrado.
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Footer */}
        <div className="p-4 border-t border-navy-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-navy-500">
                Mostrando <span className="font-medium">{filteredCases.length > 0 ? indexOfFirstItem + 1 : 0}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredCases.length)}</span> de <span className="font-medium">{filteredCases.length}</span> resultados
            </span>
            
            <div className="flex items-center gap-1">
                <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1 rounded-md hover:bg-navy-50 text-navy-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-md text-xs font-medium transition
                            ${currentPage === page 
                                ? 'bg-navy-800 text-white' 
                                : 'text-navy-600 hover:bg-navy-50'
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-1 rounded-md hover:bg-navy-50 text-navy-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>

      {/* New/Edit Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                <div className="bg-navy-900 px-6 py-4 flex justify-between items-center border-b border-navy-800">
                    <h3 className="text-white font-bold text-lg">{editingId ? 'Editar Processo' : 'Novo Processo'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-navy-300 hover:text-white transition text-2xl leading-none">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-navy-600 uppercase">Número do Processo</label>
                            <input 
                                required
                                name="number"
                                value={formData.number}
                                onChange={handleChange}
                                type="text" 
                                placeholder="0000000-00.0000.0.00.0000" 
                                className="w-full px-3 py-2 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 outline-none transition"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-navy-600 uppercase">Status</label>
                            <select 
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 outline-none transition"
                            >
                                <option value={CaseStatus.ACTIVE}>Ativo</option>
                                <option value={CaseStatus.PENDING}>Pendente</option>
                                <option value={CaseStatus.URGENT}>Urgente</option>
                                <option value={CaseStatus.CLOSED}>Arquivado</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-navy-600 uppercase">Título da Ação</label>
                        <input 
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            type="text" 
                            placeholder="Ex: Ação Trabalhista vs Empresa X" 
                            className="w-full px-3 py-2 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 outline-none transition"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-navy-600 uppercase">Cliente</label>
                            <input 
                                required
                                name="client"
                                value={formData.client}
                                onChange={handleChange}
                                type="text" 
                                placeholder="Nome do Cliente" 
                                className="w-full px-3 py-2 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 outline-none transition"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-navy-600 uppercase">Advogado Resp.</label>
                            <input 
                                name="responsibleLawyer"
                                value={formData.responsibleLawyer}
                                onChange={handleChange}
                                type="text" 
                                placeholder="Dr(a). Responsável" 
                                className="w-full px-3 py-2 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 outline-none transition"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-navy-600 uppercase">Próxima Audiência (Opcional)</label>
                        <input 
                            name="nextHearing"
                            value={formData.nextHearing}
                            onChange={handleChange}
                            type="text"
                            placeholder="DD/MM/AAAA HH:mm" 
                            className="w-full px-3 py-2 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 outline-none transition"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-navy-600 uppercase">Descrição</label>
                        <textarea 
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Breve resumo do caso..." 
                            className="w-full px-3 py-2 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-navy-500 outline-none transition resize-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-navy-50 mt-6">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)} 
                            className="px-4 py-2 text-navy-600 hover:bg-navy-50 rounded-lg font-medium text-sm transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-500 font-medium text-sm shadow-md hover:shadow-lg transition"
                        >
                            {editingId ? 'Salvar Alterações' : 'Criar Processo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm p-4 transition-all">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Trash className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900 mb-2">Excluir Processo?</h3>
                    <p className="text-navy-500 text-sm mb-6">
                        Você tem certeza que deseja excluir este processo? Esta ação é irreversível e removerá todos os dados associados.
                    </p>
                    <div className="flex justify-center gap-3">
                        <button 
                            onClick={cancelDelete} 
                            className="px-4 py-2 text-navy-600 hover:bg-navy-50 rounded-lg font-medium text-sm transition"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm shadow-md hover:shadow-lg transition"
                        >
                            Sim, Excluir
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};