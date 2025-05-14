import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // <-- Replace with your MySQL username
  password: 'Manamnikhil@1234', // <-- Replace with your MySQL password
  database: 'examcell',
}); 