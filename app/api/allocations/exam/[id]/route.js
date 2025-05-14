import { pool } from '@/lib/db'

export async function GET(request, { params }) {
  const { id } = params
  
  try {
    const [rows] = await pool.query(`
      SELECT 
        ra.*,
        d.name as department,
        c.name as course,
        COUNT(s.id) as student_count
      FROM room_allocations ra
      JOIN departments d ON ra.department_id = d.id
      JOIN courses c ON ra.course_id = c.id
      LEFT JOIN students s ON ra.id = s.allocation_id
      WHERE ra.exam_id = ?
      GROUP BY ra.id
      ORDER BY ra.date, ra.session
    `, [id])
    
    return Response.json(rows)
  } catch (error) {
    console.error('Error fetching exam allocations:', error)
    return Response.json({ error: 'Failed to fetch allocations' }, { status: 500 })
  }
} 