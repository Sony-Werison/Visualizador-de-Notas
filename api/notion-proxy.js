/**
 * Esta é a função serverless para a Vercel que atua como um proxy para a API do Notion.
 * Ela é compatível com o ambiente da Vercel (req, res).
 */
export default async function handler(request, response) {
  const { pageId } = request.query;
  const NOTION_API_KEY = process.env.NOTION_API_KEY;

  if (!pageId) {
    return response.status(400).json({ message: 'O parâmetro "pageId" é obrigatório.' });
  }
  if (!NOTION_API_KEY) {
    return response.status(500).json({ message: 'A API Key do Notion não está configurada no servidor.' });
  }

  const PAGE_API_URL = `https://api.notion.com/v1/pages/${pageId}`;
  const BLOCKS_API_URL = `https://api.notion.com/v1/blocks/${pageId}/children`;

  const headers = {
    'Authorization': `Bearer ${NOTION_API_KEY}`,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
  };

  try {
    const [pageResponse, blocksResponse] = await Promise.all([
      fetch(PAGE_API_URL, { headers }),
      fetch(BLOCKS_API_URL, { headers })
    ]);

    const pageData = await pageResponse.json();
    const blocksData = await blocksResponse.json();

    if (!pageResponse.ok) {
        return response.status(pageResponse.status).json(pageData);
    }
    if (!blocksResponse.ok) {
        return response.status(blocksResponse.status).json(blocksData);
    }
    
    response.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');

    return response.status(200).json({
      page: pageData,
      blocks: blocksData
    });

  } catch (error) {
    return response.status(500).json({ message: `Erro ao contatar a API do Notion: ${error.message}` });
  }
}
