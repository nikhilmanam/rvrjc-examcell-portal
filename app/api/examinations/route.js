import { pool } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  
  try {
    let query = 'SELECT * FROM examinations'
    let params = []
    
    if (status) {
      query += ' WHERE status = ?'
      params.push(status)
    }
    
    query += ' ORDER BY start_date DESC'
    
    const [rows] = await pool.query(query, params)
    return Response.json(rows)
  } catch (error) {
    console.error('Error fetching examinations:', error)
    return Response.json({ error: 'Failed to fetch examinations' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, start_date, end_date, morning_start_time, morning_end_time, afternoon_start_time, afternoon_end_time } = body
    if (!title || !start_date || !end_date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const [result] = await pool.query(
      `INSERT INTO examinations (title, start_date, end_date, morning_start_time, morning_end_time, afternoon_start_time, afternoon_end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, start_date, end_date, morning_start_time, morning_end_time, afternoon_start_time, afternoon_end_time]
    )
    const [rows] = await pool.query('SELECT * FROM examinations WHERE id = ?', [result.insertId])
    return Response.json(rows[0])
  } catch (error) {
    console.error('Error creating examination:', error)
    return Response.json({ error: 'Failed to create examination' }, { status: 500 })
  }
} 