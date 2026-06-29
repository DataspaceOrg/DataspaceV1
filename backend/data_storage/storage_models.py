from pydantic import BaseModel
from typing import Literal, Optional
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
# Dataset directory from the base directory.
DATA_ROOT = BASE_DIR / "datasets"

METADATA_DB = BASE_DIR / "metadata.db"
# Agent queries table name in the metadata database.
AGENT_QUERIES_TABLE = "agent_queries"
# Agent queries table name in the metadata database.
AGENT_SESSIONS_TABLE = "agent_sessions"

class AgentSession(BaseModel):
    '''
    AgentSession is a model that represents the agent session of a dataset that gets uploaded to the database.
    '''
    session_id: str
    user_id: str
    dataset_id: str
    table_name: str
    current_step: str
    created_at: str
    updated_at: str

class AgentQuery(BaseModel):
  '''
  AgentQuery is a model that represents the agent query of a dataset that gets uploaded to the database.
  '''
  step_id: str
  session_id: str
  agent_step: str
  prompt_input: str
  response_output: str
  created_at: str