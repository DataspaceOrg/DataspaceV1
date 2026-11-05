CREATE TABLE Dataset (
    id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Dataset PRIMARY KEY DEFAULT NEWID(),
    user_id      UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_Dataset_Users REFERENCES Users(id),
    upload_type  NVARCHAR(20)     NOT NULL, 
    path         NVARCHAR(1000)   NULL,         
    name         NVARCHAR(255)    NULL,
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
