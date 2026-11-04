CREATE TABLE Dataset (
    id           UNIQUEIDENTIFIER NOT NULL
                 CONSTRAINT PK_Dataset PRIMARY KEY DEFAULT NEWID(),
    user_id      UNIQUEIDENTIFIER NOT NULL
                 CONSTRAINT FK_Dataset_Users REFERENCES Users(id),
    upload_type  NVARCHAR(20)     NOT NULL,        -- e.g. 'csv', 'xlsx', 'sql'
    raw_bytes    VARBINARY(MAX)   NULL,            -- VARBINARY(MAX) instead of CHAR: raw file bytes (CSV/Excel) are binary, and CHAR
                                                   -- would corrupt them (and CHAR with no length is only 1 character). Nullable because
                                                   -- the file itself lives in Azure Blob Storage (see "path"); remove if not needed.
    path         NVARCHAR(1000)   NULL,            -- Blob Storage path
    name         NVARCHAR(255)    NOT NULL,
    description  NVARCHAR(MAX)    NULL,
    [columns]    NVARCHAR(MAX)    NULL,            -- JSON array of column names
    [tables]     NVARCHAR(MAX)    NULL,            -- JSON array of table names (SQL uploads)
    [schema]     NVARCHAR(MAX)    NULL,            -- JSON schema (SQL uploads)
    CONSTRAINT CK_Dataset_columns_json CHECK ([columns] IS NULL OR ISJSON([columns]) = 1),
    CONSTRAINT CK_Dataset_tables_json  CHECK ([tables]  IS NULL OR ISJSON([tables])  = 1),
    CONSTRAINT CK_Dataset_schema_json  CHECK ([schema]  IS NULL OR ISJSON([schema])  = 1)
);
GO

CREATE INDEX IX_Dataset_user_id ON Dataset(user_id);
GO
