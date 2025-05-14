import { pool } from '@/lib/db'

export async function GET(request, { params }) {
  const { id } = params
  
  try {
    // Get all allocations for this employee, including exam details
    const [rows] = await pool.query(`
      SELECT 
        ra.date,
        ra.session,
        ra.room_number as room,
        e.title as exam_title,
        e.status
      FROM room_allocations ra
      JOIN examinations e ON ra.exam_id = e.id
      WHERE ra.employee_id = ?
      ORDER BY ra.date DESC
    `, [id])

    return Response.json(rows)
  } catch (error) {
    console.error('Error fetching employee allocations:', error)
    return Response.json({ error: 'Failed to fetch allocations' }, { status: 500 })
  }
} 