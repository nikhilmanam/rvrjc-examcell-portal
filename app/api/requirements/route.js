import { pool } from '@/lib/db';

// GET: /api/requirements?exam_id=1
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const exam_id = searchParams.get('exam_id');
  if (!exam_id) {
    return Response.json({ error: 'Missing exam_id' }, { status: 400 });
  }
  try {
    const [rows] = await pool.query(
      `SELECT * FROM requirements WHERE exam_id = ? ORDER BY date, department_id`,
      [exam_id]
    );
    return Response.json(rows);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return Response.json({ error: 'Failed to fetch requirements' }, { status: 500 });
  }
}

// POST: /api/requirements
// Body: { exam_id, department_id, date, morning, afternoon }
export async function POST(request) {
  const { exam_id, department_id, date, morning, afternoon } = await request.json();
  if (!exam_id || !department_id || !date) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    // Upsert requirement
    await pool.query(
      `INSERT INTO requirements (exam_id, department_id, date, morning, afternoon)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE morning = VALUES(morning), afternoon = VALUES(afternoon)`,
      [exam_id, department_id, date, morning || 0, afternoon || 0]
    );
    return Response.json({ message: 'Requirement saved' });
  } catch (error) {
    console.error('Error saving requirement:', error);
    return Response.json({ error: 'Failed to save requirement' }, { status: 500 });
  }
} 