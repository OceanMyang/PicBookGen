CREATE TABLE IF NOT EXISTS users (
    userid        UUID        PRIMARY KEY,
    email         TEXT        UNIQUE NOT NULL,
    password_hash TEXT        NOT NULL,
    createdat     TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS files (
    fileid    UUID        PRIMARY KEY,
    name      TEXT        NOT NULL,
    author    UUID        NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
    createdat TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deletedat TIMESTAMPTZ
);
