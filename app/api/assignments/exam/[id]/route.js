import { pool } from '@/lib/db'

export async function GET(request, { params }) {
  const { id } = params
  
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.*,
        e.name as employee_name,
        e.designation,
        d.name as department
      FROM assignments a
      JOIN employees e ON a.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE a.exam_id = ?
      ORDER BY a.date, a.session
    `, [id])
    
    return Response.json(rows)
  } catch (error) {
    console.error('Error fetching exam assignments:', error)
    return Response.json({ error: 'Failed to fetch assignments' }, { status: 500 })
  }
} 