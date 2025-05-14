import { pool } from '@/lib/db';

export async function GET() {
  const [rows] = await pool.query('SELECT * FROM room_allocations');
  return Response.json(rows);
} 