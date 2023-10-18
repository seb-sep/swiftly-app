
import { Audio } from 'expo-av';

const customRecordingOptions: Audio.RecordingOptions = {
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: '.wav',
    outputFormat: Audio.IOSOutputFormat.ALAW,
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

export async function startRecording(): Promise<Audio.Recording> {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(customRecordingOptions);
    return recording;
}
  
export async function stopRecording(recording: Audio.Recording): Promise<string> {
    console.log('Stopping recording..');
    if (!recording) {
    throw new ReferenceError('recording state somehow undefined here');
    }
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
    });
    const uri = recording.getURI();

    if (uri) {
        return uri;
    } else {
        throw new ReferenceError('uri is undefined');
    }
    
}

