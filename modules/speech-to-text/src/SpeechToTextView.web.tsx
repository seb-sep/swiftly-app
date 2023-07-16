import * as React from 'react';

import { SpeechToTextViewProps } from './SpeechToText.types';

export default function SpeechToTextView(props: SpeechToTextViewProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
