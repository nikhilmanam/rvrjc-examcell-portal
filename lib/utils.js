export const isEmployeeChangeAllowed = (examDate, session) => {
  const now = new Date()
  const examDateTime = new Date(examDate)

  // Set hours based on session
  if (session === "AM") {
    examDateTime.setHours(9, 0, 0) // Assuming morning exam starts at 9 AM
  } else {
    examDateTime.setHours(14, 0, 0) // Assuming afternoon exam starts at 2 PM
  }

  // Calculate time difference in milliseconds
  const timeDiff = examDateTime.getTime() - now.getTime()

  // Convert to hours
  const hoursDiff = timeDiff / (1000 * 60 * 60)

  // Return true if more than 2 hours before exam
  return hoursDiff > 2
}
