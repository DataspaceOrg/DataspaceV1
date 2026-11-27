-- SecurityContext: one row per issued login token.
-- Only a HASH of the token is stored; the real token is sent to the client once.
CREATE TABLE SecurityContext (
    id          UNIQUEIDENTIFIER NOT NULL
                CONSTRAINT PK_SecurityContext PRIMARY KEY DEFAULT NEWID(),
    user_id     UNIQUEIDENTIFIER NOT NULL
                CONSTRAINT FK_SecurityContext_Users REFERENCES Users(id),
    token_hash  CHAR(64)         NOT NULL
                CONSTRAINT UQ_SecurityContext_token_hash UNIQUE,  -- SHA-256 hex digest
    created_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    expires_at  DATETIME2        NOT NULL,
    revoked_at  DATETIME2        NULL                              -- set on logout
);
GO

CREATE INDEX IX_SecurityContext_user_id ON SecurityContext(user_id);
GO