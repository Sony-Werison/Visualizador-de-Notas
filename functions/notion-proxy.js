/**
 * Esta é a função serverless que atua como um proxy seguro para a API do Notion.
 * Ela recebe o ID da página, busca a API Key de uma variável de ambiente segura,
 * faz a chamada para a API do Notion e retorna os resultados para o frontend.
 */
exports.handler = async function(event, context) {
  // Pega o pageId dos parâmetros da URL (?pageId=...)
  const { pageId } = event.queryStringParameters;
  
  // Pega a API Key das variáveis de ambiente configuradas na Netlify.
  // Isso é seguro e mantém sua chave secreta.
  const NOTION_API_KEY = process.env.NOTION_API_KEY;

  // Validação para garantir que os dados necessários estão presentes
  if (!pageId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'O parâmetro "pageId" é obrigatório.' })
    };
  }
  if (!NOTION_API_KEY) {
      return {
          statusCode: 500,
          body: JSON.stringify({ message: 'A API Key do Notion não está configurada no servidor.' })
      }
  }

  const API_URL = `https://api.notion.com/v1/blocks/${pageId}/children`;

  try {
    // Faz a chamada para a API real do Notion
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    // Se a resposta do Notion for um erro, repassa o erro
    if (!response.ok) {
       return { 
           statusCode: response.status, 
           body: JSON.stringify(data) 
        };
    }

    // Se tudo deu certo, retorna os dados para o frontend
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    // Em caso de erro de rede ou outro problema
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Erro ao contatar a API do Notion: ${error.message}` })
    };
  }
};
