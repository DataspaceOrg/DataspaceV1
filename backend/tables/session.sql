CREATE TABLE [Session] (
    id            UNIQUEIDENTIFIER NOT NULL
                  CONSTRAINT PK_Session PRIMARY KEY DEFAULT NEWID(),
    user_id       UNIQUEIDENTIFIER NOT NULL
                  CONSTRAINT FK_Session_Users REFERENCES Users(id),
    dataset_id    UNIQUEIDENTIFIER NOT NULL
                  CONSTRAINT FK_Session_Dataset REFERENCES Dataset(id),
    dataset_name  NVARCHAR(255)    NULL,
    context       NVARCHAR(MAX)    NULL,           -- JSON
    status        NVARCHAR(30)     NOT NULL DEFAULT 'active',
    created_at    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at    DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Session_context_json CHECK (context IS NULL OR ISJSON(context) = 1)
);
GO

CREATE INDEX IX_Session_user_id    ON [Session](user_id);
CREATE INDEX IX_Session_dataset_id ON [Session](dataset_id);
GO
