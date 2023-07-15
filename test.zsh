curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: multipart/form-data" \
  -F file="@../test.m4a" \
  -F model="whisper-1"
