import { requireNativeViewManager } from 'expo-modules-core';
import * as React from 'react';

import { SpeechToTextViewProps } from './SpeechToText.types';

const NativeView: React.ComponentType<SpeechToTextViewProps> =
  requireNativeViewManager('SpeechToText');

export default function SpeechToTextView(props: SpeechToTextViewProps) {
  return <NativeView {...props} />;
}
