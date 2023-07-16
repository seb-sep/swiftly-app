const axios = require('axios');
const { Configuration, OpenAIApi }= require('openai');
const fs = require('fs');

const apikey = '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'

/*
const client = axios.create({
    headers: {
        Authorization: `Bearer ${apikey}`
    },
});

client.post('https://api.openai.com/v1/audio/transcriptions', {
    'file': '../test.m4a',
    'model': 'whisper-1'
}).then((result) => {
    console.log(JSON.stringify(result));
}).catch((err) => {
    console.error(err);
});
*/


async function transcribeAudio(path) {
    const config = new Configuration({
        apiKey: apikey,
    });
    const openai = new OpenAIApi(config);


    const transcription = await openai.createTranscription(
        File(),
        "whisper-1"
    );
    console.log(transcription);
}
//transcribeAudio('../test.m4a');
