import React, { useState } from 'react';
import { Search, Gavel, Scale } from './Icons';
import { searchTJRS, searchTJRSMock } from '../services/tjrsService';
import { TJRSResult } from '../types';

export const TJRSQuery: React.FC = () => {
  const [searchType, setSearchType] = useState<'number' | 'name' | 'key'>('number');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TJRSResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Toggle entre Modo Real e Modo Demo
  const [isDemoMode, setIsDemoMode] = useState(true);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    setErrorMsg(null);
    setResults([]);
    
    try {
      let data: TJRSResult[] = [];
      if (isDemoMode) {
          data = await searchTJRSMock(query, searchType);
      } else {
          data = await searchTJRS(query, searchType);
      }
      setResults(data);
    } catch (error: any) {
      console.error("Erro na busca TJRS", error);
      setErrorMsg("O navegador bloqueou o acesso à API do Governo (Erro CORS) ou o serviço está indisponível. Ative o 'Modo Demo' acima para testar o layout com dados simulados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
             <Gavel className="w-6 h-6 text-gold-600" /> Consulta Processual (DataJud)
          </h2>
          <p className="text-navy-500 text-sm">Acesse a base de dados oficial do CNJ em tempo real.</p>
        </div>
        
        {/* Toggle Modo Demo */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-navy-100 shadow-sm">
            <span className={`text-xs font-semibold uppercase ${!isDemoMode ? 'text-navy-800' : 'text-navy-400'}`}>API Real</span>
            <button 
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center ${isDemoMode ? 'bg-gold-500' : 'bg-navy-200'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDemoMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-xs font-semibold uppercase ${isDemoMode ? 'text-gold-600' : 'text-navy-400'}`}>Modo Demo</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-6 relative">
        {isDemoMode && (
             <div className="absolute top-0 right-0 bg-gold-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold uppercase tracking-wider">
                 Ambiente Simulado
             </div>
        )}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:w-1/4 space-y-1">
                <label className="text-xs font-semibold text-navy-600 uppercase">Tipo de Busca</label>
                <select 
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-navy-200 rounded-lg text-sm text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-500"
                >
                    <option value="number">Número do Processo</option>
                    <option value="name">Nome da Parte</option>
                    <option value="key">Chave do Processo</option>
                </select>
            </div>
            
            <div className="w-full md:w-1/2 space-y-1">
                <label className="text-xs font-semibold text-navy-600 uppercase">
                    {searchType === 'number' ? 'Digite o número (Ex: 500...)' : 
                     searchType === 'name' ? 'Digite o nome completo' : 'Digite a chave de acesso'}
                </label>
                <div className="relative">
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={isDemoMode ? "Digite qualquer termo para testar..." : "Pesquisar na base oficial..."}
                        className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-navy-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
                    />
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading || !query}
                className={`w-full md:w-auto px-6 py-2.5 text-white rounded-lg font-medium text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed
                    ${isDemoMode ? 'bg-gold-600 hover:bg-gold-500' : 'bg-navy-800 hover:bg-navy-700'}
                `}
            >
                {loading ? (
                    <>Buscando...</>
                ) : (
                    <><Search className="w-4 h-4" /> Consultar</>
                )}
            </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-navy-100 overflow-hidden">
         <div className="p-4 border-b border-navy-100 bg-navy-50/50 flex justify-between items-center">
            <h3 className="font-semibold text-navy-800 text-sm">Resultados da Pesquisa</h3>
            {results.length > 0 && <span className="text-xs text-navy-400">{results.length} encontrado(s)</span>}
         </div>

         {loading ? (
             <div className="p-12 text-center">
                 <div className={`w-12 h-12 border-4 border-navy-200 rounded-full animate-spin mx-auto mb-4 ${isDemoMode ? 'border-t-gold-500' : 'border-t-navy-600'}`}></div>
                 <p className="text-navy-500 text-sm">{isDemoMode ? 'Gerando resultados simulados...' : 'Conectando ao DataJud...'}</p>
             </div>
         ) : errorMsg ? (
             <div className="p-12 text-center">
                 <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Scale className="w-6 h-6" />
                 </div>
                 <h4 className="text-red-700 font-medium mb-1">Falha na Conexão</h4>
                 <p className="text-navy-500 text-sm max-w-lg mx-auto mb-4">{errorMsg}</p>
                 <button 
                    onClick={() => setIsDemoMode(true)}
                    className="text-gold-600 font-semibold text-sm hover:underline"
                 >
                    Alternar para Modo Demo
                 </button>
             </div>
         ) : hasSearched && results.length === 0 ? (
             <div className="p-12 text-center text-navy-400">
                 <Scale className="w-12 h-12 mx-auto mb-3 opacity-20" />
                 <p>Nenhum processo encontrado.</p>
                 <p className="text-xs text-navy-300 mt-2">
                    {isDemoMode ? 'Tente digitar "Maria" ou "500".' : 'Verifique se o número contém todos os dígitos (CNJ).'}
                 </p>
             </div>
         ) : !hasSearched ? (
             <div className="p-12 text-center text-navy-400">
                 <p>Preencha os campos acima para iniciar a busca.</p>
             </div>
         ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-navy-600">
                    <thead className="bg-navy-50 text-navy-800 uppercase font-medium text-xs">
                        <tr>
                            <th className="px-6 py-4">Processo</th>
                            <th className="px-6 py-4">Vara / Comarca</th>
                            <th className="px-6 py-4">Partes</th>
                            <th className="px-6 py-4">Última Movimentação</th>
                            <th className="px-6 py-4">Data Últ. Mov.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-50">
                        {results.map((r) => (
                            <tr key={r.id} className="hover:bg-navy-50/50 transition">
                                <td className="px-6 py-4 font-mono font-medium text-navy-700 whitespace-nowrap align-top">
                                    {r.number}
                                    <div className="text-xs text-navy-400 font-sans mt-1">Ajuizado em: {r.date}</div>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium max-w-[150px] align-top text-navy-600 leading-relaxed" title={r.court}>
                                    {r.court}
                                </td>
                                <td className="px-6 py-4 max-w-xs align-top text-xs leading-relaxed whitespace-pre-line" title={r.parties}>
                                    {r.parties}
                                </td>
                                <td className="px-6 py-4 align-top">
                                    <span className="text-navy-900 font-medium block max-w-[200px] leading-snug" title={r.status}>{r.status}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap align-top">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${isDemoMode ? 'bg-gold-50 text-gold-700' : 'bg-blue-50 text-blue-700'}`}>
                                        {r.lastMovement}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
         )}
      </div>
    </div>
  );
};