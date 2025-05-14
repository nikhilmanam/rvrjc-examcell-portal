import { pool } from '@/lib/db';

export async function GET() {
  const [rows] = await pool.query('SELECT * FROM departments');
  return Response.json(rows);
} 