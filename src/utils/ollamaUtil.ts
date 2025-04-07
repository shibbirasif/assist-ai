import ollama, { Message } from 'ollama';

export async function generateResponse(model: string, messages: Message[]) {
    return await ollama.chat({
        model: model,
        messages: messages,
        stream: true,
    });
}