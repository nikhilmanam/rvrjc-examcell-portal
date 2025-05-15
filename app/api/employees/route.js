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

export async function POST(request) {
  const { name, qualification, designation, department_id, role_id } = await request.json();
  if (!name || !qualification || !designation || !department_id || !role_id) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO employees (name, qualification, designation, department_id, role_id, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [name, qualification, designation, department_id, role_id, '$2a$10$2b2b2b2b2b2b2b2b2b2b2uQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw'] // default hash for 'password'
    );
    return Response.json({ message: 'Employee added', id: result.insertId });
  } catch (error) {
    console.error('Error adding employee:', error);
    return Response.json({ error: 'Failed to add employee' }, { status: 500 });
  }
} 