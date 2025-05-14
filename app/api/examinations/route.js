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