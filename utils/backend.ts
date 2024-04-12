import axios, { AxiosError, isAxiosError } from 'axios';
import { transcribe } from 'whisper-kit-expo';

import * as fs from 'expo-file-system';

export async function saveNote(username: string, content: string): Promise<void> {
    const url = getBackendURL();

    try {
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

export type Note = {
    id: number
    title: string
    content: string
    created: string
    favorite: boolean
}

export async function getNote(username: string, id: string): Promise<Note> {
    const url = getBackendURL();

    try {
        const response = await axios.get(`${url}/users/${username}/notes/${id}`);
        return response.data as Note;
    } catch (error) {
        console.error(error);
        throw(error);
    }
}

export async function deleteNote(username: string, id: string): Promise<void> {
    const url = getBackendURL();

    try {
        const response = await axios.delete(`${url}/users/${username}/notes/${id}`);
        if (response.status >= 400) {
            throw new Error(`Error deleting note: ${response.data}`);
        }
    } catch (error) {
        if (isAxiosError(error)) {
            console.error(`Error deleting note: ${JSON.stringify(error.response?.data)}`);
        }
    }
}

export async function setNoteFavorite(username: string, id: string, favorite: boolean): Promise<void> {
    const url = getBackendURL();

    try {
        const response = await axios.patch(`${url}/users/${username}/notes/${id}/favorite`, { favorite: favorite });
        if (response.status >= 400) {
            throw new Error(`Error setting note favorite: ${response.data}`);
        }
    } catch (error) {
        if (isAxiosError(error)) {
            console.error(`Error setting note favorite: ${JSON.stringify(error.response?.data)}`);
        }
    }
}

export type noteTitle = {
    id: number
    title: string
    created: Date
    favorite: boolean
}

export async function getTitles(username: string): Promise<noteTitle[]> {
    const url = getBackendURL();

    try {
        const response = await axios.get(`${url}/users/${username}/notes`);
        response.data.forEach((note: any) => {
            note.created = new Date(note.created);
        });
        return response.data as noteTitle[];
    } catch (error) {
        if (isAxiosError(error)) {
            console.error(`Error getting titles: ${JSON.stringify(error.response)}`);
        }
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
        return JSON.parse(result.body).text;
    } catch (error) {
        console.log("Error in audio transcription: ", error);
        return JSON.stringify(error);
    }
}

export async function transcribeNoteAndSave(username: string, fileUri: string): Promise<string> {
    const url = getBackendURL();
    try {
        const result = await fs.uploadAsync(`${url}/users/${username}/notes/transcribe`, fileUri, {
            headers: {
                "Accept": "application/json",
                "Content-Type": 'multipart/form-data'
            },
            fieldName: 'speech_bytes',
            httpMethod: 'POST',
            uploadType: fs.FileSystemUploadType.MULTIPART
            });
        return JSON.parse(result.body).text;
    } catch (error) {
        console.log("Error in audio transcription: ", error);
        return JSON.stringify(error);
    }

}


export async function chatWithNotes(username: string, query: string): Promise<string> {
    console.log('about to chat w notes');
    const url = getBackendURL();
    try {
        const result = await axios.post(`${url}/users/${username}/notes/chat`, { content: query } );
        return result.data.text;
    } catch (error) {
        console.log("Error in note chat: ", JSON.stringify(error));
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

/*
Ping the backend without waiting for the response to warm it up
*/
export function ping(): void {
    const url = getBackendURL();
    axios.get(`${url}/`).then((response) => {
        console.log(response.data);
    }).catch((error) => {
        console.log(error);
    })
}
