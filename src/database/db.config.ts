import { createPool } from "mysql2/promise";
import 'dotenv/config';


export const connect =async()=>{

  const connection = createPool({
        host:     process.env.DB_HOST,
        user:     process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        port:     Number(process.env.DB_PORT),
        connectionLimit: 10
    });
    return connection;
}