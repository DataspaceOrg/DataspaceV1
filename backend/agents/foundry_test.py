from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient

import os
from dotenv import load_dotenv
load_dotenv()

print("Imports finished.", flush=True)

with (
    DefaultAzureCredential() as credential,
    AIProjectClient(
        endpoint=os.environ["AGENTS_CONNECTION_STRING"],
        credential=credential,
        allow_preview=True,
    ) as project_client,
):
    # Bind the OpenAI client to the existing agent endpoint.
    print("Working")
    openai_client = project_client.get_openai_client(agent_name=agent_name)

    # GitHub Copilot preview agents require a conversation for every Responses turn.
    conversation = openai_client.conversations.create()
    response = openai_client.responses.create(
        conversation=conversation.id,
        input=[{"role": "user", "content": user_message}],
    )

    print(f"Response output: {response.output_text}")
