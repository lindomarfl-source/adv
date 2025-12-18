import { TJRSResult } from "../types";

// Chave Pública Oficial do DataJud (CNJ)
const DATAJUD_API_KEY = "cDZHYzlZa0JadVREZDJCendQbTNsaXUyZnM6AyBA";

// A API do DataJud bloqueia requisições diretas do navegador (CORS).
// Usamos um proxy (corsproxy.io) para adicionar os cabeçalhos necessários.
const TARGET_URL = "https://api-publica.datajud.cnj.jus.br/api_publica_tjp/_search";
const PROXY_URL = "https://corsproxy.io/?";
const DATAJUD_URL = `${PROXY_URL}${TARGET_URL}`;

interface DataJudHit {
  _id: string;
  _source: {
    dadosBasicos: {
      numero: string;
      dataAjuizamento: string;
      classeProcessual: number;
      orgaoJulgador: {
        nomeOrgao: string;
      };
      poloAtivo: Array<{ parte: { pessoa: { nome: string } } }>;
      poloPassivo: Array<{ parte: { pessoa: { nome: string } } }>;
    };
    movimentos: Array<{
      dataHora: string;
      nomeMovimento: string;
    }>;
  };
}

export const searchTJRS = async (query: string, type: 'number' | 'name' | 'key'): Promise<TJRSResult[]> => {
  try {
    let elasticQuery: any = {};

    // Sanitização básica
    const cleanQuery = query.trim();
    const cleanNumber = cleanQuery.replace(/\D/g, '');

    if (type === 'number') {
      // Busca exata pelo número do processo
      elasticQuery = {
        bool: {
          must: [
            { match: { "numeroProcesso": cleanNumber.length > 0 ? cleanNumber : cleanQuery } }
          ]
        }
      };
    } else if (type === 'name') {
      // Busca textual nos polos
      elasticQuery = {
        bool: {
          should: [
            { match_phrase: { "dadosBasicos.poloAtivo.parte.pessoa.nome": cleanQuery } },
            { match_phrase: { "dadosBasicos.poloPassivo.parte.pessoa.nome": cleanQuery } }
          ],
          minimum_should_match: 1
        }
      };
    } else {
      // Chave ou ID
      elasticQuery = {
         match: { "_id": cleanQuery }
      };
    }
    
    const payload = {
      query: elasticQuery,
      size: 10,
      sort: [{ "dadosBasicos.dataAjuizamento": { order: "desc" } }]
    };

    const response = await fetch(DATAJUD_URL, {
      method: "POST",
      headers: {
        "Authorization": `APIKey ${DATAJUD_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Tenta ler o erro do corpo se existir
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(`DataJud API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const hits: DataJudHit[] = data.hits?.hits || [];

    return hits.map(hit => mapDataJudToResult(hit));

  } catch (error) {
    console.error("Erro ao buscar no DataJud:", error);
    throw error;
  }
};

export const searchTJRSMock = async (query: string, type: 'number' | 'name' | 'key'): Promise<TJRSResult[]> => {
    // Simulando delay de rede
    await new Promise(resolve => setTimeout(resolve, 800));
  
    if (!query) return [];
  
    const mockData: TJRSResult[] = [
      {
        id: 'tj-1',
        number: '5001234-56.2024.8.21.0001',
        parties: 'Autor: João Silva \nRéu: Seguradora X',
        status: 'Em Andamento',
        court: '1ª Vara Cível - Porto Alegre',
        lastMovement: 'Conclusos para Despacho',
        date: '20/05/2024'
      },
      {
        id: 'tj-2',
        number: '5022222-11.2023.8.21.0001',
        parties: 'Autor: Ministerio Publico \nRéu: Carlos Santos',
        status: 'Aguardando Audiência',
        court: '2ª Vara Criminal - Canoas',
        lastMovement: 'Expedição de Mandado',
        date: '18/05/2024'
      },
      {
        id: 'tj-3',
        number: '5009876-44.2022.8.21.0010',
        parties: 'Exequente: Banco Y \nExecutado: Empresa Z',
        status: 'Suspenso',
        court: '3ª Vara Cível - Caxias do Sul',
        lastMovement: 'Suspensão por falta de bens',
        date: '10/02/2024'
      },
      {
          id: 'tj-4',
          number: '5111111-99.2024.8.21.0001',
          parties: 'Autor: Maria Oliveira \nRéu: Construtora ABC',
          status: 'Sentença Proferida',
          court: '4ª Vara Cível - Porto Alegre',
          lastMovement: 'Julgada Procedente a Ação',
          date: '24/05/2024'
      }
    ];
  
    // Filtro simples mockado
    return mockData.filter(item => {
      const q = query.toLowerCase();
      if (type === 'number') return item.number.includes(q);
      if (type === 'name') return item.parties.toLowerCase().includes(q);
      return true;
    });
};

const mapDataJudToResult = (hit: DataJudHit): TJRSResult => {
  const source = hit._source;
  const basicos = source.dadosBasicos;
  
  // Extrair partes com tratamento seguro
  const autores = basicos.poloAtivo?.map(p => p.parte.pessoa.nome).join(", ") || "Não informado";
  const reus = basicos.poloPassivo?.map(p => p.parte.pessoa.nome).join(", ") || "Não informado";
  
  // Extrair última movimentação
  const ultimoMovimento = source.movimentos?.sort((a, b) => 
    new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime()
  )[0];

  // Formatar data
  const dataAjuizamento = basicos.dataAjuizamento 
    ? new Date(basicos.dataAjuizamento).toLocaleDateString('pt-BR') 
    : '-';

  return {
    id: hit._id,
    number: basicos.numero,
    parties: `Autor: ${autores} \nRéu: ${reus}`,
    status: ultimoMovimento ? ultimoMovimento.nomeMovimento : 'Sem movimentação recente',
    lastMovement: ultimoMovimento ? new Date(ultimoMovimento.dataHora).toLocaleDateString('pt-BR') : '-',
    court: basicos.orgaoJulgador?.nomeOrgao || 'Tribunal não identificado',
    date: dataAjuizamento
  };
};