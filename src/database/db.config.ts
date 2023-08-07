import { createPool, Pool } from "mysql2/promise";
import 'dotenv/config';

let connection: Pool | null = null;
export const connect =async()=>{

  if(!connection){
    connection = createPool({
          host:     process.env.DB_HOST,
          user:     process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_DATABASE,
          port:     Number(process.env.DB_PORT),
          connectionLimit: 10,
          timezone: 'Z'
      });
  }
    return connection;
}

export const disconnect = async () => {
  if (connection) {
    const p = await connection;
    await p.end();
  }
}