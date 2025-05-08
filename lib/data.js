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

// Mock employees data with more employees in each department
export const employees = {
  CSE: [
    { id: "41011", name: "Mr. Mabubashar", designation: "Assistant Professor" },
    { id: "41012", name: "Dr. Jane Smith", designation: "Associate Professor" },
    { id: "41013", name: "Dr. John Doe", designation: "Professor" },
    { id: "41014", name: "Dr. Robert Johnson", designation: "Professor" },
    { id: "41015", name: "Ms. Emily Wilson", designation: "Assistant Professor" },
    { id: "41016", name: "Dr. Michael Brown", designation: "Associate Professor" },
    { id: "41017", name: "Dr. Sarah Davis", designation: "Professor" },
    { id: "41018", name: "Mr. David Miller", designation: "Assistant Professor" },
  ],
  CSBS: [
    { id: "42011", name: "Dr. Thomas Wilson", designation: "Professor" },
    { id: "42012", name: "Ms. Jennifer Lee", designation: "Assistant Professor" },
    { id: "42013", name: "Dr. Richard Taylor", designation: "Associate Professor" },
    { id: "42014", name: "Dr. Patricia Moore", designation: "Professor" },
    { id: "42015", name: "Mr. James Anderson", designation: "Assistant Professor" },
    { id: "42016", name: "Dr. Elizabeth White", designation: "Associate Professor" },
  ],
  "CSE (DS)": [
    { id: "43011", name: "Dr. William Harris", designation: "Professor" },
    { id: "43012", name: "Ms. Barbara Martin", designation: "Assistant Professor" },
    { id: "43013", name: "Dr. Charles Thompson", designation: "Associate Professor" },
    { id: "43014", name: "Dr. Susan Garcia", designation: "Professor" },
    { id: "43015", name: "Mr. Joseph Martinez", designation: "Assistant Professor" },
  ],
  "CSE (IoT)": [
    { id: "44011", name: "Dr. Margaret Robinson", designation: "Professor" },
    { id: "44012", name: "Mr. Thomas Clark", designation: "Assistant Professor" },
    { id: "44013", name: "Dr. Dorothy Rodriguez", designation: "Associate Professor" },
    { id: "44014", name: "Dr. Christopher Lewis", designation: "Professor" },
    { id: "44015", name: "Ms. Lisa Walker", designation: "Assistant Professor" },
  ],
  "CSE (AI&ML)": [
    { id: "45011", name: "Dr. Daniel Hall", designation: "Professor" },
    { id: "45012", name: "Ms. Nancy Allen", designation: "Assistant Professor" },
    { id: "45013", name: "Dr. Paul Young", designation: "Associate Professor" },
    { id: "45014", name: "Dr. Betty King", designation: "Professor" },
    { id: "45015", name: "Mr. Mark Wright", designation: "Assistant Professor" },
  ],
  ECE: [
    { id: "51022", name: "Dr. Sarah Johnson", designation: "Associate Professor" },
    { id: "51023", name: "Mr. Robert Williams", designation: "Assistant Professor" },
    { id: "51024", name: "Dr. Linda Scott", designation: "Professor" },
    { id: "51025", name: "Dr. Edward Green", designation: "Professor" },
    { id: "51026", name: "Ms. Karen Baker", designation: "Assistant Professor" },
    { id: "51027", name: "Dr. Steven Nelson", designation: "Associate Professor" },
  ],
  EEE: [
    { id: "52011", name: "Dr. Helen Carter", designation: "Professor" },
    { id: "52012", name: "Mr. Donald Mitchell", designation: "Assistant Professor" },
    { id: "52013", name: "Dr. Sandra Perez", designation: "Associate Professor" },
    { id: "52014", name: "Dr. George Roberts", designation: "Professor" },
    { id: "52015", name: "Ms. Donna Turner", designation: "Assistant Professor" },
  ],
  MECH: [
    { id: "61033", name: "Dr. Michael Brown", designation: "Professor" },
    { id: "61034", name: "Ms. Emily Wilson", designation: "Assistant Professor" },
    { id: "61035", name: "Dr. Kenneth Phillips", designation: "Associate Professor" },
    { id: "61036", name: "Dr. Ruth Campbell", designation: "Professor" },
    { id: "61037", name: "Mr. Ronald Parker", designation: "Assistant Professor" },
    { id: "61038", name: "Dr. Deborah Evans", designation: "Associate Professor" },
  ],
  CIVIL: [
    { id: "71044", name: "Ms. Emily Davis", designation: "Assistant Professor" },
    { id: "71045", name: "Dr. David Miller", designation: "Professor" },
    { id: "71046", name: "Dr. Sharon Collins", designation: "Associate Professor" },
    { id: "71047", name: "Dr. Larry Edwards", designation: "Professor" },
    { id: "71048", name: "Ms. Carol Stewart", designation: "Assistant Professor" },
    { id: "71049", name: "Dr. Jerry Sanchez", designation: "Associate Professor" },
  ],
  CHEMICAL: [
    { id: "81011", name: "Dr. Jessica Morris", designation: "Professor" },
    { id: "81012", name: "Mr. Frank Rogers", designation: "Assistant Professor" },
    { id: "81013", name: "Dr. Melissa Reed", designation: "Associate Professor" },
    { id: "81014", name: "Dr. Howard Cook", designation: "Professor" },
    { id: "81015", name: "Ms. Kimberly Morgan", designation: "Assistant Professor" },
  ],
  IT: [
    { id: "91011", name: "Dr. Raymond Bell", designation: "Professor" },
    { id: "91012", name: "Ms. Virginia Murphy", designation: "Assistant Professor" },
    { id: "91013", name: "Dr. Lawrence Rivera", designation: "Associate Professor" },
    { id: "91014", name: "Dr. Kathleen Cooper", designation: "Professor" },
    { id: "91015", name: "Mr. Arthur Richardson", designation: "Assistant Professor" },
  ],
  MBA: [
    { id: "10011", name: "Dr. Angela Cox", designation: "Professor" },
    { id: "10012", name: "Mr. Stephen Bailey", designation: "Assistant Professor" },
    { id: "10013", name: "Dr. Diane Gray", designation: "Associate Professor" },
    { id: "10014", name: "Dr. Gregory James", designation: "Professor" },
    { id: "10015", name: "Ms. Rachel Watson", designation: "Assistant Professor" },
  ],
  MCA: [
    { id: "11011", name: "Dr. Wayne Brooks", designation: "Professor" },
    { id: "11012", name: "Ms. Theresa Kelly", designation: "Assistant Professor" },
    { id: "11013", name: "Dr. Ralph Sanders", designation: "Associate Professor" },
    { id: "11014", name: "Dr. Louise Price", designation: "Professor" },
    { id: "11015", name: "Mr. Johnny Bennett", designation: "Assistant Professor" },
  ],
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
