import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const { name, password } = await request.json();
  console.log('Login attempt:', { name, password }); // Debug log
  
  try {
    // First check if it's a special user (admin, exam-section, coordinator)
    const specialUsers = {
      'Admin': { role: 'admin', department: 'Administration' },
      'Exam Admin': { role: 'exam-section', department: 'Examination' },
      'Dr. Coordinator CSE': { role: 'coordinator', department: 'CSE' },
      'Dr. Coordinator CSBS': { role: 'coordinator', department: 'CSBS' },
      'Dr. Coordinator CSE (DS)': { role: 'coordinator', department: 'CSE (DS)' },
      'Dr. Coordinator CSE (IoT)': { role: 'coordinator', department: 'CSE (IoT)' },
      'Dr. Coordinator CSE (AI&ML)': { role: 'coordinator', department: 'CSE (AI&ML)' },
      'Dr. Coordinator ECE': { role: 'coordinator', department: 'ECE' },
      'Dr. Coordinator EEE': { role: 'coordinator', department: 'EEE' },
      'Dr. Coordinator MECH': { role: 'coordinator', department: 'MECH' },
      'Dr. Coordinator CIVIL': { role: 'coordinator', department: 'CIVIL' },
      'Dr. Coordinator CHEMICAL': { role: 'coordinator', department: 'CHEMICAL' },
      'Dr. Coordinator IT': { role: 'coordinator', department: 'IT' },
      'Dr. Coordinator MBA': { role: 'coordinator', department: 'MBA' },
      'Dr. Coordinator MCA': { role: 'coordinator', department: 'MCA' }
    }

    if (specialUsers[name]) {
      // For special users, check if password is 'password'
      if (password === 'password') {
        return Response.json({
          message: 'Login successful',
          user: {
            name,
            role: specialUsers[name].role,
            department: specialUsers[name].department
          }
        })
      }
    } else {
      // For regular employees, check the database
      const [rows] = await pool.query(
        'SELECT * FROM employees WHERE name = ?',
        [name]
      )

      if (rows.length > 0) {
        const user = rows[0]
        // For now, accept 'password' as the default password
        if (password === 'password') {
          return Response.json({
            message: 'Login successful',
            user: {
              id: user.id,
              name: user.name,
              role: 'employee',
              department: user.department,
              designation: user.designation
            }
          })
        }
      }
    }

    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
} 