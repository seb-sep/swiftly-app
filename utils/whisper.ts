import { initWhisper } from 'whisper.rn'

export async function transcribe(fileUri: string): Promise<string> {
    const whisperContext = await initWhisper({
        filePath: 'file://.../ggml-tiny.en.bin',
    })
    const options = { language: 'en' }
    const { stop, promise } = whisperContext.transcribe(fileUri, options)
    const { result } = await promise
    return result
}