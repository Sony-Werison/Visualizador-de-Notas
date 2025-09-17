/**
 * Esta é a função serverless que atua como um proxy seguro para a API do Notion.
 * Agora ela busca tanto os detalhes da página (como o título) quanto os blocos de conteúdo.
 */
exports.handler = async function(event, context) {
  const { pageId } = event.queryStringParameters;
  const NOTION_API_KEY = process.env.NOTION_API_KEY;

  if (!pageId) {
    return { statusCode: 400, body: JSON.stringify({ message: 'O parâmetro "pageId" é obrigatório.' }) };
  }
  if (!NOTION_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ message: 'A API Key do Notion não está configurada no servidor.' }) };
  }

  const PAGE_API_URL = `https://api.notion.com/v1/pages/${pageId}`;
  const BLOCKS_API_URL = `https://api.notion.com/v1/blocks/${pageId}/children`;

  const headers = {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    // Busca os detalhes da página e os blocos em paralelo para mais eficiência
    const [pageResponse, blocksResponse] = await Promise.all([
      fetch(PAGE_API_URL, { headers }),
      fetch(BLOCKS_API_URL, { headers })
    ]);

    const pageData = await pageResponse.json();
    const blocksData = await blocksResponse.json();

    if (!pageResponse.ok) {
       return { statusCode: pageResponse.status, body: JSON.stringify(pageData) };
    }
    if (!blocksResponse.ok) {
        return { statusCode: blocksResponse.status, body: JSON.stringify(blocksData) };
    }
    
    // Retorna um objeto combinado com as informações da página e o conteúdo
    return {
      statusCode: 200,
      body: JSON.stringify({
        page: pageData,
        blocks: blocksData
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Erro ao contatar a API do Notion: ${error.message}` })
    };
  }
};

