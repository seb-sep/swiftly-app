import axios from 'axios';

import * as fs from 'expo-file-system';
import { Configuration, OpenAIApi } from 'openai';

export async function saveNote(username: string, title: string, content: string): Promise<string> {
    const url = getBackendURL();

    try {
        const response = await axios.post(`${url}/${username}/notes/save`, { title: title, content: content });
        return response.data;
                    
    } catch (error) {
        console.error(error);
    }

    return ""

}

export async function getNote(username: string, title: string): Promise<string> {
    const url = getBackendURL();

    try {
        const response = await axios.get(`${url}/${username}/notes/${title}`);
        return response.data.content as string;
    } catch (error) {
        console.error(error);
        throw(error);
    }
}

export async function getTitles(username: string): Promise<string[]> {
    const url = getBackendURL();

    try {
        const response = await axios.get(`${url}/${username}/notes`);
        return response.data as string[];
    } catch (error) {
        console.error(error);
        throw error;
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