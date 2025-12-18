import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const generateLegalAssistance = async (prompt: string, context?: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    let fullPrompt = `Você é um assistente jurídico sênior altamente qualificado. Seu objetivo é ajudar advogados com resumos, redação de peças, análise de documentos e estratégia legal. Responda de forma profissional, direta e juridicamente embasada.`;

    if (context) {
      fullPrompt += `\n\nCONTEXTO DO CASO:\n${context}`;
    }

    fullPrompt += `\n\nSOLICITAÇÃO DO USUÁRIO:\n${prompt}`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
    });

    return response.text || "Não foi possível gerar uma resposta. Tente novamente.";
  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação jurídica. Verifique sua conexão ou a chave da API.";
  }
};

export const summarizeDocument = async (documentText: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Resuma o seguinte texto jurídico, destacando os pontos principais, datas importantes e obrigações:\n\n${documentText}`,
        });
        return response.text || "Não foi possível resumir o documento.";
    } catch (error) {
        console.error("Erro ao resumir:", error);
        return "Erro ao processar o resumo.";
    }
}