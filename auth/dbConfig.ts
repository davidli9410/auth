// This should only contain database connection config

export const config = {
    HOST: process.env.DB_HOST || "localhost",
    USER: process.env.DB_USER || "postgres",
    PASSWORD: process.env.DB_PASSWORD || "postgres",
    DB: process.env.DB_NAME || "postgres",
    PORT: parseInt(process.env.DB_PORT || "5432")
}