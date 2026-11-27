from azure.identity import DefaultAzureCredential
from azure.ai.projects import AIProjectClient
from azure.ai.projects.models import PromptAgentDefinition, CodeInterpreterTool, AutoCodeInterpreterToolParam
import os
from dotenv import load_dotenv
from pathlib import Path

csv_path = (
    Path(__file__).resolve().parent.parent
    / "datasets"
    / "account_profiles.csv"
)

load_dotenv()


class InsightAgentAzure:
    def __init__(self):
        self.credential = DefaultAzureCredential()
        self.endpoint = os.environ["AGENTS_CONNECTION_STRING"]
        self.agent_name = os.environ["AGENTS_INSIGHT"]
        self.project_client = AIProjectClient(
            endpoint=self.endpoint, credential=self.credential)

        # Project client for file uploads
        self.file_client = self.project_client.get_openai_client()

        # Client targeting your existing Foundry agent.
        self.agent_client = self.project_client.get_openai_client(
            agent_name=self.agent_name,
        )

    def upload_csv(self, path: Path):
        with path.open("rb") as csv_file:
            uploaded = self.file_client.files.create(
                file=csv_file,
                purpose="assistants")

            self.file_id = uploaded.id
            return self.file_id

    def run_agent(self, message: str,  file_id: str, agent_version: str):
        existing = self.project_client.agents.get_version(
            agent_name=self.agent_name,
            agent_version=agent_version,
        )
        print(existing.definition.model)
        print(existing.definition.tools)

        configured_agent = self.project_client.agents.create_version(  # Create a new version of the agent
            agent_name=self.agent_name,
            definition=PromptAgentDefinition(  # Give definitions on how the agent should behave (Instructions, Model, Tools)
                model=existing.definition.model,
                instructions=existing.definition.instructions,
                tools=[
                    CodeInterpreterTool(  # Create a code interpreter tool for the model
                        container=AutoCodeInterpreterToolParam(  # Give it the ability to access the model.
                            file_ids=[file_id]
                        )
                    )
                ],
            )
        )
        conversation = self.file_client.conversations.create()

        response = self.file_client.responses.create(
            conversation=conversation.id,
            input=message,
            tool_choice="required",
            extra_body={
                "agent_reference": {
                    "name": configured_agent.name,
                    "version": configured_agent.version,
                    "type": "agent_reference",
                }
            },
        )
        return response

    def close(self):
        self.agent_client.close()
        self.file_client.close()
        self.project_client.close()
        self.credential.close()


if __name__ == "__main__":
    agent = InsightAgentAzure()

    try:
        file_id = agent.upload_csv(csv_path)

        response = agent.run_agent(
            message=(
                "Use Code Interpreter to inspect the CSV. "
                "Report its row count, column names, and missing values."
            ),
            file_id=file_id,
            agent_version="4",
        )

        print(response.output_text)

    finally:
        agent.close()

# python3 insight_azure.py
