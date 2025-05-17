import { pool } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const department_id = searchParams.get('department_id');
  let query = `SELECT e.id, e.name, e.qualification, e.designation, r.name AS role, d.name AS department
               FROM employees e
               JOIN roles r ON e.role_id = r.id
               JOIN departments d ON e.department_id = d.id`;
  let params = [];
  if (department_id) {
    query += ' WHERE e.department_id = ?';
    params.push(department_id);
  }
  const [rows] = await pool.query(query, params);
  return Response.json(rows);
} 