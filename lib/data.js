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
        set((state) => ({
            changes: {
              ...state.changes,
            [examId]: [...(state.changes[examId] || []), { ...change, id: Date.now().toString() }],
            },
        })),
      removeChange: (examId, changeId) =>
        set((state) => ({
            changes: {
              ...state.changes,
            [examId]: state.changes[examId].filter((change) => change.id !== changeId),
            },
        })),
      getChanges: (examId) => {
        const state = set.getState()
        return state.changes[examId] || []
            },
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

// Helper functions
export const isEmployeeChangeAllowed = (examDate, session) => {
  const now = new Date()
  const examDateTime = new Date(examDate)
  const hoursUntilExam = (examDateTime - now) / (1000 * 60 * 60)

  // Allow changes up to 24 hours before the exam
  return hoursUntilExam > 24
}

export const isExamCompleted = (exam) => {
  const now = new Date()
  const endDate = new Date(exam.endDate)
  return now > endDate
}

export const isExamInFuture = (exam) => {
  const now = new Date()
  const startDate = new Date(exam.startDate)
  return now < startDate
}

export const isDateInPast = (date) => {
  const now = new Date()
  const targetDate = new Date(date)
  return now > targetDate
}

// Empty employee allocations - starting with a clean slate
export const employeeAllocations = {}
