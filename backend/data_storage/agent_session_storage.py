import sqlite3
from .storage_models import METADATA_DB, AGENT_QUERIES_TABLE, AGENT_SESSIONS_TABLE, AgentSession
from datetime import datetime
import uuid

'''
agent_session_storage.py is a module that contains the functions to create and manage agent sessions for a specific dataset. 
For each dataset, an agent session is created which helps track the progress of an agent as it works through the dataset. 
It is connected to the insight agent for initially creating an agent session.
'''

def connect_agent_session_db():
    '''
    connect_agent_session_db: Creates the agent_sessions table if it does not exist and providers a pointer to the connection.
    '''

    conn = sqlite3.connect(METADATA_DB)

    conn.execute(f"""CREATE TABLE IF NOT EXISTS {AGENT_SESSIONS_TABLE} (session_id TEXT PRIMARY KEY, 
    dataset_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    table_name TEXT NOT NULL, 
    current_step TEXT NOT NULL, 
    created_at TEXT NOT NULL, 
    updated_at TEXT NOT NULL)""")

    conn.commit()
    return conn

def create_agent_session(user_id: str,dataset_id: str, table_name: str, current_step: str) -> AgentSession:
    '''
    create_agent_session: Creates a new agent session for a dataset and table.

    Args
        user_id: The id of the user.
        dataset_id: The id of the dataset.
        table_name: The name of the table to create a session for.
        current_step: The current step of the agent (insight, aggregation etc).

    Returns:
        session_id: The id of the agent session.
    '''

    conn = connect_agent_session_db()

    try:
        session_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        updated_at = created_at

        conn.execute(f"INSERT INTO {AGENT_SESSIONS_TABLE} (session_id, user_id, dataset_id, table_name, current_step, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (session_id, user_id, dataset_id, table_name, current_step, created_at, updated_at))
        conn.commit()

    except sqlite3.Error as exception:
        print(f"Error creating agent session: {exception}")
        raise exception

    return AgentSession(session_id=session_id, user_id=user_id,dataset_id=dataset_id, table_name=table_name, current_step=current_step, created_at=created_at, updated_at=updated_at)

def update_agent_session(session_id: str, current_step: str) -> str:
    '''
    update_agent_session: Updates the status of the agent session.
    '''

    try:
        conn = connect_agent_session_db()
        # Check the datatype of this here. 
        updated_at = datetime.now().isoformat()

        conn.execute(f"UPDATE {AGENT_SESSIONS_TABLE} SET current_step = ?, updated_at = ? WHERE session_id = ?",
        (current_step, updated_at, session_id))
        conn.commit()

    except sqlite3.Error as exception:
        print(f"Error updating agent session: {exception}")
        raise exception

    return session_id


def get_agent_session(session_id: str) -> dict:
    '''
    get_agent_session: Retrieves the agent session from the database.
    '''
    try:
        conn = connect_agent_session_db()
        cursor = conn.execute(f"SELECT * FROM {AGENT_SESSIONS_TABLE} WHERE session_id = ?", (session_id,))
        # Individual agent session row retrieved (Check for sorted by datetime for latest). 
        row = cursor.fetchone()

        if cursor is None:
            raise ValueError(f"Agent session with id {session_id} not found.")

    except sqlite3.Error as exception:
        print(f"Error getting agent session: {exception}")
        raise exception

    return AgentSession(
        session_id=cursor[0],
        dataset_id=cursor[1],
        table_name=cursor[2],
        current_step=cursor[3],
        created_at=cursor[4],
        updated_at=cursor[5],
    )

def restore_table_session(user_id: str, dataset_id: str, table_name: str) -> AgentSession | None:
    '''
    restore_table_session: Retrieves the latest agent session for a table. Allows the user to continue from the last step they left off. 
    Args:
        user_id: The id of the user.
        dataset_id: The id of the dataset.
        table_name: The name of the table to restore the session for.
    
    '''
    conn = connect_agent_session_db()
    cursor = conn.execute(f"""SELECT * FROM {AGENT_SESSIONS_TABLE} WHERE user_id = ? AND dataset_id = ? AND table_name = ?
    ORDER BY updated_at DESC
    LIMIT 1""", (user_id, dataset_id, table_name))

    row = cursor.fetchone()
    if row is None:
        return None

    return AgentSession(
        session_id=row[0],
        user_id=row[1],
        dataset_id=row[2],
        table_name=row[3],
        current_step=row[4],
        created_at=row[5],
        updated_at=row[6],
    )
