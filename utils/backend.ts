import axios from 'axios';

import * as fs from 'expo-file-system';
import { Configuration, OpenAIApi } from 'openai';

export async function saveNote(username: string, title: string, content: string): Promise<string> {
    const url = getBackendURL();

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

export async function transcribeAudio(fileUri: string): Promise<string> {
    const url = getBackendURL();
    try {
        const result = await fs.uploadAsync(`${url}/transcribe`, fileUri, {
            headers: {
                "Accept": "application/json",
                "Content-Type": 'multipart/form-data'
            },
            httpMethod: 'POST',
            uploadType: fs.FileSystemUploadType.MULTIPART
            });
        return result.body;
    } catch (error) {
        return JSON.stringify(error);
    }

}

function getBackendURL(): string {
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (!url) {
        throw new Error('Backend URL is undefined.');
    }
    return url
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