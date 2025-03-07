from mira_sdk import MiraClient, Flow
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

api_key = os.getenv("API_KEY")

# Initialize the client
client = MiraClient(config={"API_KEY": api_key})

emoji_flow = Flow(source="emoji_flow.yaml")
summary_flow = Flow(source="summarize_flow.yaml")
def gptResponse(text):
    input_dict = {"topic": "Story", "text": text}

    response = client.flow.test(emoji_flow, input_dict)
    #print(response['result'])
    return response['result']

def getSummary(text):
    input_dict = {"topic": "Story", "text": text}

    response = client.flow.test(summary_flow, input_dict)
    #print(response['result'])
    return response['result']
