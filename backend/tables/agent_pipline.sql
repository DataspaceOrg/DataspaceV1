-- AgentPipeline: one run of the multi-stage pipeline. Each stage stores its JSON output.
CREATE TABLE AgentPipeline (
    id           UNIQUEIDENTIFIER NOT NULL
                 CONSTRAINT PK_AgentPipeline PRIMARY KEY DEFAULT NEWID(),
    user_id      UNIQUEIDENTIFIER NOT NULL
                 CONSTRAINT FK_AgentPipeline_Users REFERENCES Users(id),
    session_id   UNIQUEIDENTIFIER NOT NULL
                 CONSTRAINT FK_AgentPipeline_Session REFERENCES [Session](id),
    name         NVARCHAR(255)    NULL,
    [Statistics]   NVARCHAR(MAX)    NULL,            -- JSON
    Insight      NVARCHAR(MAX)    NULL,            -- JSON
    Analysis     NVARCHAR(MAX)    NULL,            -- JSON
    Execution    NVARCHAR(MAX)    NULL,            -- JSON
    Summary      NVARCHAR(MAX)    NULL,            -- JSON
    created_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_AgentPipeline_json CHECK (
        ([Statistics] IS NULL OR ISJSON([Statistics]) = 1) AND
        (Insight    IS NULL OR ISJSON(Insight)    = 1) AND
        (Analysis   IS NULL OR ISJSON(Analysis)   = 1) AND
        (Execution  IS NULL OR ISJSON(Execution)  = 1) AND
        (Summary    IS NULL OR ISJSON(Summary)    = 1)
    )
);
GO

CREATE INDEX IX_AgentPipeline_session_id ON AgentPipeline(session_id);
GO