import { pool } from '@/lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  if (!examId) return Response.json({ error: 'Missing examId' }, { status: 400 });
  try {
    const [rows] = await pool.query('SELECT * FROM requirements WHERE exam_id = ?', [examId]);
    return Response.json(rows.length > 0 ? JSON.parse(rows[0].data) : []);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return Response.json({ error: 'Failed to fetch requirements' }, { status: 500 });
  }
}

export async function POST(request) {
  const { examId, requirements } = await request.json();
  if (!examId || !requirements) return Response.json({ error: 'Missing data' }, { status: 400 });
  try {
    // Upsert requirements
    await pool.query(
      'INSERT INTO requirements (exam_id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
      [examId, JSON.stringify(requirements)]
    );
    return Response.json({ message: 'Requirements saved' });
  } catch (error) {
    console.error('Error saving requirements:', error);
    return Response.json({ error: 'Failed to save requirements' }, { status: 500 });
  }
} 