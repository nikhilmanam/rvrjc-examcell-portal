import { pool } from '@/lib/db'

export async function DELETE(request, { params }) {
  const { id } = params
  try {
    const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return Response.json({ error: 'Room not found' }, { status: 404 })
    }
    return Response.json({ message: 'Room deleted' })
  } catch (error) {
    console.error('Error deleting room:', error)
    return Response.json({ error: 'Failed to delete room' }, { status: 500 })
  }
} 