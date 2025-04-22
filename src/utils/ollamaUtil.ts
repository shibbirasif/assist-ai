import ollama, { Message } from 'ollama';

export async function generateResponse(model: string, messages: Message[]) {
    return await ollama.chat({
        model: model,
        messages: messages,
        stream: true,
    });
}


export async function listModels() {
    try {
        const response = await ollama.list();
        return response.models;
    } catch (error) {
        console.error('Error listing models:', error);
        return [];
    }
}