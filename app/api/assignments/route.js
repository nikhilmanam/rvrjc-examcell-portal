import { pool } from '@/lib/db'

// GET: /api/assignments?exam_id=...&department_id=...&date=...
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const exam_id = searchParams.get('exam_id')
  const department_id = searchParams.get('department_id')
  const date = searchParams.get('date')
  let query = `
    SELECT a.*, e.name, e.designation
    FROM assignments a
    JOIN employees e ON a.employee_id = e.id
    WHERE 1=1
  `
  const params = []
  if (exam_id) { query += ' AND a.exam_id = ?'; params.push(exam_id) }
  if (department_id) { query += ' AND a.department_id = ?'; params.push(department_id) }
  if (date) { query += ' AND a.date = ?'; params.push(date) }
  query += ' ORDER BY a.date, a.session, a.employee_id'
  const [rows] = await pool.query(query, params)
  return Response.json(rows)
}

// POST: Add assignment
export async function POST(request) {
  const { exam_id, department_id, employee_id, date, session } = await request.json()
  if (!exam_id || !department_id || !employee_id || !date || !session) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 })
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO assignments (exam_id, department_id, employee_id, date, session) VALUES (?, ?, ?, ?, ?)',
      [exam_id, department_id, employee_id, date, session]
    )
    const [rows] = await pool.query('SELECT * FROM assignments WHERE id = ?', [result.insertId])
    return Response.json(rows[0])
  } catch (error) {
    console.error('Error saving assignment:', error)
    return Response.json({ error: 'Failed to save assignment' }, { status: 500 })
  }
}

// DELETE: Remove assignment by id
export async function DELETE(request) {
  const { assignment_id } = await request.json()
  if (!assignment_id) {
    return Response.json({ error: 'Missing assignment_id' }, { status: 400 })
  }
  try {
    await pool.query('DELETE FROM assignments WHERE id = ?', [assignment_id])
    return Response.json({ message: 'Assignment deleted' })
  } catch (error) {
    console.error('Error deleting assignment:', error)
    return Response.json({ error: 'Failed to delete assignment' }, { status: 500 })
  }
} 