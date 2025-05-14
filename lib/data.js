// This file simulates a database with JSON data
import { create } from "zustand"
import { persist } from "zustand/middleware"

// Store for authentication
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    },
  ),
)

// Store for examinations
export const useExamStore = create(
  persist(
    (set) => ({
      examinations: [],
      addExamination: (examination) =>
        set((state) => ({
          examinations: [...state.examinations, { ...examination, id: Date.now().toString(), status: "incomplete" }],
        })),
      updateExamination: (id, data) =>
        set((state) => ({
          examinations: state.examinations.map((exam) => (exam.id === id ? { ...exam, ...data } : exam)),
        })),
      completeExamination: (id) =>
        set((state) => ({
          examinations: state.examinations.map((exam) => (exam.id === id ? { ...exam, status: "complete" } : exam)),
        })),
      deleteExamination: (id) =>
        set((state) => ({
          examinations: state.examinations.filter((exam) => exam.id !== id),
        })),
    }),
    {
      name: "exam-storage",
    },
  ),
)

// Store for departments
export const departments = [
  "CSE",
  "CSBS",
  "CSE (DS)",
  "CSE (IoT)",
  "CSE (AI&ML)",
  "ECE",
  "EEE",
  "MECH",
  "CIVIL",
  "CHEMICAL",
  "IT",
  "MBA",
  "MCA",
]

// Store for rooms
export const useRoomStore = create(
  persist(
    (set) => ({
      rooms: [],
      addRoom: (room) =>
        set((state) => ({
          rooms: [...state.rooms, { ...room, id: Date.now().toString() }],
        })),
      deleteRoom: (id) =>
        set((state) => ({
          rooms: state.rooms.filter((room) => room.id !== id),
        })),
    }),
    {
      name: "room-storage",
    },
  ),
)

// Store for requirements
export const useRequirementsStore = create(
  persist(
    (set) => ({
      requirements: {},
      setRequirements: (examId, dateRequirements) =>
        set((state) => ({
          requirements: {
            ...state.requirements,
            [examId]: dateRequirements,
          },
        })),
    }),
    {
      name: "requirements-storage",
    },
  ),
)

// Store for assignments
export const useAssignmentStore = create(
  persist(
    (set, get) => ({
      assignments: {},
      addAssignment: (examId, departmentId, assignment) =>
        set((state) => {
          const examAssignments = state.assignments[examId] || {}
          const deptAssignments = examAssignments[departmentId] || []

          return {
            assignments: {
              ...state.assignments,
              [examId]: {
                ...examAssignments,
                [departmentId]: [...deptAssignments, assignment],
              },
            },
          }
        }),
      removeAssignment: (examId, departmentId, assignmentId) =>
        set((state) => {
          const examAssignments = state.assignments[examId] || {}
          const deptAssignments = examAssignments[departmentId] || []

          return {
            assignments: {
              ...state.assignments,
              [examId]: {
                ...examAssignments,
                [departmentId]: deptAssignments.filter((a) => a.id !== assignmentId),
              },
            },
          }
        }),
      updateAssignment: (examId, departmentId, assignmentId, updatedData) =>
        set((state) => {
          const examAssignments = state.assignments[examId] || {}
          const deptAssignments = examAssignments[departmentId] || []

          return {
            assignments: {
              ...state.assignments,
              [examId]: {
                ...examAssignments,
                [departmentId]: deptAssignments.map((a) => (a.id === assignmentId ? { ...a, ...updatedData } : a)),
              },
            },
          }
        }),
      getAssignmentsByDate: (examId, date) => {
        const { assignments } = get()
        const examAssignments = assignments[examId] || {}
        const result = {}

        // Iterate through all departments
        Object.keys(examAssignments).forEach((deptId) => {
          // Filter assignments for this date
          const dateAssignments = examAssignments[deptId].filter(
            (assignment) => new Date(assignment.date).toDateString() === new Date(date).toDateString(),
          )
          if (dateAssignments.length > 0) {
            result[deptId] = dateAssignments
          }
        })

        return result
      },
      getAssignmentsByDateAndDepartment: (examId, date, departmentId) => {
        const { assignments } = get()
        const examAssignments = assignments[examId] || {}
        const deptAssignments = examAssignments[departmentId] || []

        return deptAssignments.filter(
          (assignment) => new Date(assignment.date).toDateString() === new Date(date).toDateString(),
        )
      },
      getAssignmentDates: (examId) => {
        const { assignments } = get()
        const examAssignments = assignments[examId] || {}
        const allDates = new Set()

        // Collect all unique dates from all departments
        Object.values(examAssignments).forEach((deptAssignments) => {
          deptAssignments.forEach((assignment) => {
            allDates.add(new Date(assignment.date).toDateString())
          })
        })

        return Array.from(allDates).map((dateStr) => new Date(dateStr))
      },
      getAssignmentsByDepartment: (examId, departmentId) => {
        const { assignments } = get()
        const examAssignments = assignments[examId] || {}
        return examAssignments[departmentId] || []
      },
    }),
    {
      name: "assignments-storage",
    },
  ),
)

// Store for allocations
export const useAllocationStore = create(
  persist(
    (set) => ({
      allocations: {},
      setAllocations: (examId, dateAllocations) =>
        set((state) => ({
          allocations: {
            ...state.allocations,
            [examId]: dateAllocations,
          },
        })),
      addDateAllocation: (examId, date, allocation) =>
        set((state) => {
          const examAllocations = state.allocations[examId] || {}
          const dateStr = new Date(date).toDateString()
          const dateAllocations = examAllocations[dateStr] || []

          return {
            allocations: {
              ...state.allocations,
              [examId]: {
                ...examAllocations,
                [dateStr]: [...dateAllocations, allocation],
              },
            },
          }
        }),
      getAllocationsByDate: (examId, date) => {
        const state = set.getState()
        const examAllocations = state.allocations[examId] || {}
        const dateStr = new Date(date).toDateString()
        return examAllocations[dateStr] || []
      },
    }),
    {
      name: "allocations-storage",
    },
  ),
)

// Store for employee changes
export const useEmployeeChangeStore = create(
  persist(
    (set) => ({
      changes: {},
      addChange: (examId, change) =>
        set((state) => {
          const examChanges = state.changes[examId] || []
          return {
            changes: {
              ...state.changes,
              [examId]: [...examChanges, { ...change, id: Date.now().toString(), timestamp: new Date().toISOString() }],
            },
          }
        }),
      approveChange: (examId, changeId) =>
        set((state) => {
          const examChanges = state.changes[examId] || []
          return {
            changes: {
              ...state.changes,
              [examId]: examChanges.map((change) => (change.id === changeId ? { ...change, approved: true } : change)),
            },
          }
        }),
      rejectChange: (examId, changeId) =>
        set((state) => {
          const examChanges = state.changes[examId] || []
          return {
            changes: {
              ...state.changes,
              [examId]: examChanges.map((change) => (change.id === changeId ? { ...change, approved: false } : change)),
            },
          }
        }),
    }),
    {
      name: "employee-changes-storage",
    },
  ),
)

// Mock user data
export const users = {
  // Employee
  emp123: { id: "emp123", password: "password", name: "Mr. Mabubashar", role: "employee", department: "CSE" },

  // Admin
  admin123: { id: "admin123", password: "password", name: "Admin", role: "admin", department: "Administration" },

  // Exam Section
  exam123: { id: "exam123", password: "password", name: "Exam Admin", role: "exam-section", department: "Examination" },

  // Coordinators for all departments
  coord_cse: {
    id: "coord_cse",
    password: "password",
    name: "Dr. Coordinator CSE",
    role: "coordinator",
    department: "CSE",
  },
  coord_csbs: {
    id: "coord_csbs",
    password: "password",
    name: "Dr. Coordinator CSBS",
    role: "coordinator",
    department: "CSBS",
  },
  coord_csds: {
    id: "coord_csds",
    password: "password",
    name: "Dr. Coordinator CSE (DS)",
    role: "coordinator",
    department: "CSE (DS)",
  },
  coord_csiot: {
    id: "coord_csiot",
    password: "password",
    name: "Dr. Coordinator CSE (IoT)",
    role: "coordinator",
    department: "CSE (IoT)",
  },
  coord_csaiml: {
    id: "coord_csaiml",
    password: "password",
    name: "Dr. Coordinator CSE (AI&ML)",
    role: "coordinator",
    department: "CSE (AI&ML)",
  },
  coord_ece: {
    id: "coord_ece",
    password: "password",
    name: "Dr. Coordinator ECE",
    role: "coordinator",
    department: "ECE",
  },
  coord_eee: {
    id: "coord_eee",
    password: "password",
    name: "Dr. Coordinator EEE",
    role: "coordinator",
    department: "EEE",
  },
  coord_mech: {
    id: "coord_mech",
    password: "password",
    name: "Dr. Coordinator MECH",
    role: "coordinator",
    department: "MECH",
  },
  coord_civil: {
    id: "coord_civil",
    password: "password",
    name: "Dr. Coordinator CIVIL",
    role: "coordinator",
    department: "CIVIL",
  },
  coord_chemical: {
    id: "coord_chemical",
    password: "password",
    name: "Dr. Coordinator CHEMICAL",
    role: "coordinator",
    department: "CHEMICAL",
  },
  coord_it: { id: "coord_it", password: "password", name: "Dr. Coordinator IT", role: "coordinator", department: "IT" },
  coord_mba: {
    id: "coord_mba",
    password: "password",
    name: "Dr. Coordinator MBA",
    role: "coordinator",
    department: "MBA",
  },
  coord_mca: {
    id: "coord_mca",
    password: "password",
    name: "Dr. Coordinator MCA",
    role: "coordinator",
    department: "MCA",
  },
}

// Helper function to check if employee change is allowed (within 2 hours of exam)
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

// Helper function to check if an exam is completed
export const isExamCompleted = (exam) => {
  if (!exam) return false

  const now = new Date()
  const endDate = new Date(exam.endDate)
  endDate.setHours(23, 59, 59) // End of the day

  return now > endDate || exam.status === "complete"
}

// Helper function to check if an exam is in the future
export const isExamInFuture = (exam) => {
  if (!exam) return false

  const now = new Date()
  const startDate = new Date(exam.startDate)
  startDate.setHours(0, 0, 0) // Start of the day

  return now < startDate
}

// Helper function to check if a date is in the past
export const isDateInPast = (date) => {
  const now = new Date()
  const checkDate = new Date(date)
  checkDate.setHours(23, 59, 59) // End of the day

  return now > checkDate
}

// Empty employee allocations - starting with a clean slate
export const employeeAllocations = {}
