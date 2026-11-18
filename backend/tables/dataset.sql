IF OBJECT_ID(N'dbo.Dataset', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Dataset (
        id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Dataset PRIMARY KEY DEFAULT NEWID(),
        user_id       UNIQUEIDENTIFIER NOT NULL CONSTRAINT FK_Dataset_Users REFERENCES dbo.Users(id),
        upload_type   NVARCHAR(20)     NOT NULL,
        path          NVARCHAR(1000)   NOT NULL,
        raw_byte_size BIGINT           NOT NULL,
        name          NVARCHAR(255)    NULL,
        description   NVARCHAR(MAX)    NULL,
        [columns]     NVARCHAR(MAX)    NULL,
        [tables]      NVARCHAR(MAX)    NULL,
        [schema]      NVARCHAR(MAX)    NULL,
        CONSTRAINT CK_Dataset_columns_json CHECK ([columns] IS NULL OR ISJSON([columns]) = 1),
        CONSTRAINT CK_Dataset_tables_json  CHECK ([tables]  IS NULL OR ISJSON([tables]) = 1),
        CONSTRAINT CK_Dataset_schema_json  CHECK ([schema]  IS NULL OR ISJSON([schema]) = 1)
    );
END;
GO

IF COL_LENGTH('dbo.Dataset', 'raw_byte_size') IS NULL
    ALTER TABLE dbo.Dataset ADD raw_byte_size BIGINT NULL;
GO

-- Check new writes without backfilling any rows from the earlier schema.
IF OBJECT_ID(N'dbo.CK_Dataset_blob_metadata', N'C') IS NULL
    ALTER TABLE dbo.Dataset WITH NOCHECK ADD CONSTRAINT CK_Dataset_blob_metadata
        CHECK (path IS NOT NULL AND path LIKE LOWER(CONVERT(NVARCHAR(36), id)) + N'/_%'
               AND raw_byte_size IS NOT NULL AND raw_byte_size > 0);
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.Dataset') AND name = 'IX_Dataset_user_id'
)
    CREATE INDEX IX_Dataset_user_id ON dbo.Dataset(user_id);
GO
