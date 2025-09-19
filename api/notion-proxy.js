/**
 * Esta é a função serverless para a Vercel que atua como um proxy para a API do Notion.
 * Ela busca recursivamente todos os blocos aninhados para renderizar listas completas.
 */

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const headers = {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
};

// Função auxiliar para buscar dados com novas tentativas em caso de erro de limite de taxa.
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return response.json();
            }
            // Tenta novamente se o limite de taxa da API for atingido
            if (response.status === 429) { 
                await new Promise(res => setTimeout(res, delay * (i + 1)));
            } else {
                const errorData = await response.json().catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorData.message || `Erro HTTP ${response.status}`);
            }
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(res => setTimeout(res, delay * (i + 1)));
        }
    }
    throw new Error(`Falha ao buscar dados de ${url} após ${retries} tentativas.`);
}

// Função recursiva para buscar todos os blocos filhos de um determinado bloco.
async function fetchBlockChildren(blockId) {
    const BLOCKS_API_URL = `https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`;
    const data = await fetchWithRetry(BLOCKS_API_URL, { headers });
    const children = data.results;

    // Para cada bloco filho, verifica se ele também tem filhos e os busca recursivamente.
    for (const child of children) {
        if (child.has_children) {
            child.children = await fetchBlockChildren(child.id);
        }
    }
    return children;
}


export default async function handler(request, response) {
  const { pageId } = request.query;

  if (!pageId) {
    return response.status(400).json({ message: 'O parâmetro "pageId" é obrigatório.' });
  }
  if (!NOTION_API_KEY) {
    return response.status(500).json({ message: 'A API Key do Notion não está configurada no servidor.' });
  }

  const PAGE_API_URL = `https://api.notion.com/v1/pages/${pageId}`;
  
  try {
    // Busca os dados da página e todos os blocos (incluindo aninhados) em paralelo.
    const [pageData, blocks] = await Promise.all([
      fetchWithRetry(PAGE_API_URL, { headers }),
      fetchBlockChildren(pageId)
    ]);

    // Configura o cache para a resposta da API.
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    // Retorna os dados da página e a estrutura completa de blocos.
    return response.status(200).json({
      page: pageData,
      blocks: { results: blocks } 
    });

  } catch (error) {
    return response.status(500).json({ message: `Erro ao contatar a API do Notion: ${error.message}` });
  }
}
