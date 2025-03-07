from mira_sdk import MiraClient, Flow
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

api_key = os.getenv("API_KEY")

# Initialize the client
client = MiraClient(config={"API_KEY": api_key})

flow = Flow(source="compound_flow.yaml")

def gptResponse(text):
    input_dict = {"topic": "Story", "text": text}

    response = client.flow.test(flow, input_dict)
    print(response['result'])
    return response['result']

gptResponse()