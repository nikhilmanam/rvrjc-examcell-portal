import { pool } from '@/lib/db'

// GET: /api/rooms?exam_id=1
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const exam_id = searchParams.get('exam_id')
  try {
    let query = 'SELECT * FROM rooms'
    let params = []
    if (exam_id) {
      query += ' WHERE exam_id = ?'
      params.push(exam_id)
    }
    query += ' ORDER BY date, session, block, room_number'
    const [rows] = await pool.query(query, params)
    return Response.json(rows)
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return Response.json({ error: 'Failed to fetch rooms' }, { status: 500 })
  }
}

// POST: /api/rooms
// Body: { exam_id, block, room_number, type, date, session }
export async function POST(request) {
  try {
    const { exam_id, block, room_number, type, date, session } = await request.json()
    if (!exam_id || !block || !room_number || !date || !session) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    try {
      const [result] = await pool.query(
        `INSERT INTO rooms (exam_id, block, room_number, type, date, session)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [exam_id, block, room_number, type, date, session]
      )
      const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [result.insertId])
      return Response.json(rows[0])
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return Response.json({ error: 'Room already exists for this block, number, date, and session.' }, { status: 409 })
      }
      throw err
    }
  } catch (error) {
    console.error('Error creating room:', error)
    return Response.json({ error: 'Failed to create room' }, { status: 500 })
  }
} 