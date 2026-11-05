CREATE TABLE Conversation (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Conversation PRIMARY KEY DEFAULT NEWID(),
    session_id       UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_Conversation_Session REFERENCES [Session](id),
    pipeline_id      UNIQUEIDENTIFIER NULL CONSTRAINT FK_Conversation_AgentPipeline REFERENCES AgentPipeline(id),
    messages_json    NVARCHAR(MAX)    NULL,        
    response_json    NVARCHAR(MAX)    NULL,        
    response_output  NVARCHAR(MAX)    NULL,     
    created_at       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at       DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Conversation_json CHECK (
        (messages_json IS NULL OR ISJSON(messages_json) = 1) AND
        (response_json IS NULL OR ISJSON(response_json) = 1)
    )
);
GO

CREATE INDEX IX_Conversation_session_id  ON Conversation(session_id);
CREATE INDEX IX_Conversation_pipeline_id ON Conversation(pipeline_id);
GO
