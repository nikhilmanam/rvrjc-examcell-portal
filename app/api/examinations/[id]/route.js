import { pool } from '@/lib/db'

export async function GET(request, { params }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  
  try {
    const [rows] = await pool.query('SELECT * FROM examinations WHERE id = ?', [id])
    
    if (rows.length === 0) {
      return Response.json({ error: 'Examination not found' }, { status: 404 })
    }
    
    return Response.json(rows[0])
  } catch (error) {
    console.error('Error fetching examination details:', error)
    return Response.json({ error: 'Failed to fetch examination details' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const resolvedParams = await params
  const id = resolvedParams.id
  try {
    const [result] = await pool.query('DELETE FROM examinations WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return Response.json({ error: 'Examination not found' }, { status: 404 })
    }
    return Response.json({ message: 'Examination deleted' })
  } catch (error) {
    console.error('Error deleting examination:', error)
    return Response.json({ error: 'Failed to delete examination' }, { status: 500 })
  }
} 