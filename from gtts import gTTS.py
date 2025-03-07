from gtts import gTTS  
import os  

text = "नमस्ते! यह एक टेक्स्ट-टू-स्पीच परीक्षण है।"
tts = gTTS(text=text, lang='hi')  
tts.save("output.mp3")  
os.system("afplay output.mp3")  # Works for macOS