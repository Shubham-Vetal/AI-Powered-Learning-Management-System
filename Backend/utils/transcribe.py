# transcribe.py
import whisper
import sys

model = whisper.load_model("base")  # or "small", "medium", "large" this can be adjust according to needs

audio_path = sys.argv[1]

result = model.transcribe(audio_path)
print(result["text"])
