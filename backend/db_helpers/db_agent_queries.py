import sqlite3
from .db_constants import METADATA_DB, AGENT_QUERIES_TABLE, AGENT_SESSIONS_TABLE, AgentQuery
from datetime import datetime
import uuid

'''
db_agent_queries.py is a module that contains the functions to interact with the agent queries table inside of the metadata database.
'''

def connect_agent_queries_db():
    '''
    connect_agent_queries_db: Creates the agent queries table if it does not exist and providers a pointer to the connection.
    '''

    conn = sqlite3.connect(METADATA_DB)

    conn.execute(f"""CREATE TABLE IF NOT EXISTS {AGENT_QUERIES_TABLE} (step_id TEXT PRIMARY KEY, 
    session_id TEXT NOT NULL, 
    agent_step TEXT NOT NULL, 
    prompt_input TEXT NOT NULL, 
    response_output TEXT NOT NULL, 
    created_at TEXT NOT NULL)""")

    conn.commit()
    return conn

def create_agent_query(session_id: str, agent_step: str, prompt_input: str, response_output: str, created_at: str) -> str:
    '''
    create_agent_query: Creates a new agent query for a session.
    '''

    conn = connect_agent_queries_db()

    try:
        step_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()

        conn.execute(f"INSERT INTO {AGENT_QUERIES_TABLE} (step_id, session_id, agent_step, prompt_input, response_output, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        (step_id, session_id, agent_step, prompt_input, response_output, created_at))
        conn.commit()

    except sqlite3.Error as exception:
        print(f"Error creating agent query: {exception}")
        raise exception

    # Return the agent query object that was created towards the frontend. 
    return AgentQuery(step_id=step_id, session_id=session_id, agent_step=agent_step, prompt_input=prompt_input, response_output=response_output, created_at=created_at)

def get_agent_query(step_id: str) -> AgentQuery:
    '''
    get_agent_query: Retrieves a specific agent query from the database.
    '''

    conn = connect_agent_queries_db()
    cursor = conn.execute(f"SELECT * FROM {AGENT_QUERIES_TABLE} WHERE step_id = ?", (step_id,))
    row = cursor.fetchone()
    return AgentQuery(step_id=row[0], session_id=row[1], agent_step=row[2], prompt_input=row[3], response_output=row[4], created_at=row[5])

def agent_query_history(session_id: str) -> list[AgentQuery]:
    '''
    agent_query_history: Retrieves the agent queries associated with an existing session
    '''

    conn = connect_agent_queries_db()
    cursor = conn.execute(f"SELECT * FROM {AGENT_QUERIES_TABLE} WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
    rows = cursor.fetchall()
    return [AgentQuery(step_id=row[0], session_id=row[1], agent_step=row[2], prompt_input=row[3], response_output=row[4], created_at=row[5]) for row in rows]
