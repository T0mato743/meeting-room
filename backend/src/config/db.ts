import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

interface DBConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
}

const dbConfig: DBConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'meeting_room_booking',
  waitForConnections: true,
  connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

export default pool;