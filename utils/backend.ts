import axios from 'axios';
import { Configuration, OpenAIApi } from 'openai';

export async function saveNote(username: string, title: string, content: string): Promise<string> {
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (!url) {
        throw new Error('Backend URL is undefined.');
    }

    try {
        const response = await axios.post(`${url}/${username}/notes/save`, { title: title, content: content });
        return response.data;
                    
    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
        }
        console.error(error);
    }

    return ""

}
/*
async function transcribeAudio(path: string) {

    const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY;
    if (!apiKey) {
        throw new Error("API key not found.")
    }

    const config = new Configuration({
        apiKey: apiKey,
    });
    const openai = new OpenAIApi(config);


    const transcription = await openai.createTranscription(
        new File(new Blob([""]), "temp"),
        "whisper-1"
    );
    console.log(transcription);
}
*/