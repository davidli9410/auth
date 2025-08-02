import { Pool } from "pg";
import { config } from "../dbConfig";

const pool = new Pool({
    user: config.USER,
    host: config.HOST,
    database: config.DB,
    password: config.PASSWORD,
    port: config.PORT
});



export default pool;