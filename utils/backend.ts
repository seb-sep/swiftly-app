import axios, { AxiosError, isAxiosError } from 'axios';

import * as fs from 'expo-file-system';

export async function saveNote(username: string, content: string): Promise<void> {
    const url = getBackendURL();

    try {
        console.log("Trying to save note")
        const response = await axios.post(`${url}/users/${username}/notes/save`, { content: content });
        if (response.status >= 400) {
            throw new Error(`Error saving note: ${response.data}`);
        }
                    
    } catch (error) {
        if (isAxiosError(error)) {
            console.error(`Error saving note: ${JSON.stringify(error.response?.data)}`);
        }
    }

}

export async function getNote(username: string, id: string): Promise<string> {
    const url = getBackendURL();

    try {
        const response = await axios.get(`${url}/users/${username}/notes/${id}`);
        console.log(response.data.content);
        return response.data.content as string;
    } catch (error) {
        console.error(error);
        throw(error);
    }
}

export type noteTitle = {
    id: number
    title: string
}

export async function getTitles(username: string): Promise<noteTitle[]> {
    const url = getBackendURL();

    try {
        const response = await axios.get(`${url}/users/${username}/notes`);
        return response.data as noteTitle[];
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function transcribeAudio(fileUri: string): Promise<string> {
    const url = getBackendURL();
    try {
        const result = await fs.uploadAsync(`${url}/transcribe`, fileUri, {
            headers: {
                "Accept": "application/json",
                "Content-Type": 'multipart/form-data'
            },
            fieldName: 'speech_bytes',
            httpMethod: 'POST',
            uploadType: fs.FileSystemUploadType.MULTIPART
            });
        return result.body.split('"').join('');
    } catch (error) {
        console.log("Error in audio transcription: ", error);
        return JSON.stringify(error);
    }

}

export async function createAccount(email: string): Promise<boolean> {
    const url = getBackendURL();

    try {
        const response = await axios.post(`${url}/users/add`, { name: email });
        if (response.status === 200) {
            return true;
        } else {
            console.error(`Error creating account: ${response.data}}`);
            return false;
        }
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
