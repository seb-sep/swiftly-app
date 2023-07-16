import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

// Import the native module. On web, it will be resolved to SpeechToText.web.ts
// and on native platforms to SpeechToText.ts
import SpeechToTextModule from './src/SpeechToTextModule';
import SpeechToTextView from './src/SpeechToTextView';
import { ChangeEventPayload, SpeechToTextViewProps } from './src/SpeechToText.types';

// Get the native constant value.
export const PI = SpeechToTextModule.PI;

export function hello(): string {
  return SpeechToTextModule.hello();
}

export async function setValueAsync(value: string) {
  return await SpeechToTextModule.setValueAsync(value);
}

const emitter = new EventEmitter(SpeechToTextModule ?? NativeModulesProxy.SpeechToText);

export function addChangeListener(listener: (event: ChangeEventPayload) => void): Subscription {
  return emitter.addListener<ChangeEventPayload>('onChange', listener);
}

export { SpeechToTextView, SpeechToTextViewProps, ChangeEventPayload };
