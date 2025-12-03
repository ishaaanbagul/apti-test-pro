import { create } from 'zustand';

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  points: number;
}

export interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  testCases: { input: string; expectedOutput: string }[];
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  points: number;
  language: string;
}

export interface Test {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  mcqQuestions: MCQQuestion[];
  codingQuestions: CodingQuestion[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Assignment {
  id: string;
  testId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: 'pending' | 'in_progress' | 'completed' | 'expired';
  startedAt?: string;
  completedAt?: string;
  score?: number;
}

export interface TestCreationState {
  step: number;
  basicInfo: {
    name: string;
    duration: number;
    description: string;
    tags: string[];
  };
  selectedMCQs: MCQQuestion[];
  selectedCoding: CodingQuestion[];
  assignments: Omit<Assignment, 'id' | 'status'>[];
}

interface TestState {
  tests: Test[];
  assignments: Assignment[];
  testCreation: TestCreationState;
  
  // Test CRUD
  createTest: (test: Omit<Test, 'id' | 'createdAt' | 'updatedAt'>) => Test;
  updateTest: (id: string, updates: Partial<Test>) => void;
  deleteTest: (id: string) => void;
  publishTest: (id: string) => void;
  
  // Test creation wizard
  setCreationStep: (step: number) => void;
  updateBasicInfo: (info: Partial<TestCreationState['basicInfo']>) => void;
  addMCQQuestion: (question: MCQQuestion) => void;
  removeMCQQuestion: (id: string) => void;
  addCodingQuestion: (question: CodingQuestion) => void;
  removeCodingQuestion: (id: string) => void;
  addAssignment: (assignment: Omit<Assignment, 'id' | 'status'>) => void;
  removeAssignment: (candidateId: string) => void;
  resetCreation: () => void;
  
  // Assignments
  createAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
}

const initialCreationState: TestCreationState = {
  step: 1,
  basicInfo: {
    name: '',
    duration: 60,
    description: '',
    tags: [],
  },
  selectedMCQs: [],
  selectedCoding: [],
  assignments: [],
};

// Mock data
const mockMCQs: MCQQuestion[] = [
  {
    id: 'mcq-1',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    difficulty: 'easy',
    tags: ['algorithms', 'searching'],
    points: 10,
  },
  {
    id: 'mcq-2',
    question: 'Which data structure uses LIFO principle?',
    options: ['Queue', 'Stack', 'Array', 'Linked List'],
    correctAnswer: 1,
    difficulty: 'easy',
    tags: ['data structures'],
    points: 10,
  },
  {
    id: 'mcq-3',
    question: 'What is the worst-case time complexity of QuickSort?',
    options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
    correctAnswer: 2,
    difficulty: 'medium',
    tags: ['algorithms', 'sorting'],
    points: 15,
  },
  {
    id: 'mcq-4',
    question: 'Which of the following is NOT a JavaScript primitive type?',
    options: ['String', 'Number', 'Array', 'Boolean'],
    correctAnswer: 2,
    difficulty: 'easy',
    tags: ['javascript', 'basics'],
    points: 10,
  },
  {
    id: 'mcq-5',
    question: 'What does SQL stand for?',
    options: ['Structured Query Language', 'Simple Query Language', 'Standard Query Language', 'Server Query Language'],
    correctAnswer: 0,
    difficulty: 'easy',
    tags: ['database', 'sql'],
    points: 10,
  },
];

const mockCodingQuestions: CodingQuestion[] = [
  {
    id: 'code-1',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
    ],
    difficulty: 'easy',
    tags: ['arrays', 'hash-table'],
    points: 25,
    language: 'javascript',
  },
  {
    id: 'code-2',
    title: 'Reverse String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.',
    starterCode: 'function reverseString(s) {\n  // Your code here\n}',
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
    ],
    difficulty: 'easy',
    tags: ['strings', 'two-pointers'],
    points: 20,
    language: 'javascript',
  },
  {
    id: 'code-3',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.',
    starterCode: 'function isValid(s) {\n  // Your code here\n}',
    testCases: [
      { input: '"()"', expectedOutput: 'true' },
      { input: '"()[]{}"', expectedOutput: 'true' },
      { input: '"(]"', expectedOutput: 'false' },
    ],
    difficulty: 'medium',
    tags: ['stack', 'strings'],
    points: 30,
    language: 'javascript',
  },
];

const mockTests: Test[] = [
  {
    id: 'test-1',
    name: 'JavaScript Fundamentals',
    description: 'A comprehensive test covering JavaScript basics including data types, functions, and DOM manipulation.',
    duration: 60,
    tags: ['javascript', 'frontend'],
    status: 'published',
    mcqQuestions: [mockMCQs[3], mockMCQs[4]],
    codingQuestions: [mockCodingQuestions[0], mockCodingQuestions[1]],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    createdBy: '1',
  },
  {
    id: 'test-2',
    name: 'Data Structures & Algorithms',
    description: 'Test your knowledge of common data structures and algorithmic problem-solving.',
    duration: 90,
    tags: ['algorithms', 'data-structures'],
    status: 'published',
    mcqQuestions: [mockMCQs[0], mockMCQs[1], mockMCQs[2]],
    codingQuestions: [mockCodingQuestions[2]],
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
    createdBy: '1',
  },
  {
    id: 'test-3',
    name: 'Full Stack Assessment',
    description: 'Comprehensive assessment for full-stack developer candidates.',
    duration: 120,
    tags: ['fullstack', 'javascript', 'database'],
    status: 'draft',
    mcqQuestions: mockMCQs,
    codingQuestions: mockCodingQuestions,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
    createdBy: '2',
  },
];

const mockAssignments: Assignment[] = [
  {
    id: 'assign-1',
    testId: 'test-1',
    candidateId: '3',
    candidateName: 'John Candidate',
    candidateEmail: 'candidate@example.com',
    scheduledStartTime: '2024-12-01T09:00:00Z',
    scheduledEndTime: '2024-12-05T18:00:00Z',
    status: 'pending',
  },
  {
    id: 'assign-2',
    testId: 'test-2',
    candidateId: '3',
    candidateName: 'John Candidate',
    candidateEmail: 'candidate@example.com',
    scheduledStartTime: '2024-11-01T09:00:00Z',
    scheduledEndTime: '2024-11-30T18:00:00Z',
    status: 'completed',
    startedAt: '2024-11-15T10:00:00Z',
    completedAt: '2024-11-15T11:30:00Z',
    score: 85,
  },
];

export const useTestStore = create<TestState>((set, get) => ({
  tests: mockTests,
  assignments: mockAssignments,
  testCreation: initialCreationState,
  
  createTest: (test) => {
    const newTest: Test = {
      ...test,
      id: `test-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ tests: [...state.tests, newTest] }));
    return newTest;
  },
  
  updateTest: (id, updates) => {
    set((state) => ({
      tests: state.tests.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },
  
  deleteTest: (id) => {
    set((state) => ({
      tests: state.tests.filter((t) => t.id !== id),
    }));
  },
  
  publishTest: (id) => {
    set((state) => ({
      tests: state.tests.map((t) =>
        t.id === id ? { ...t, status: 'published', updatedAt: new Date().toISOString() } : t
      ),
    }));
  },
  
  setCreationStep: (step) => {
    set((state) => ({
      testCreation: { ...state.testCreation, step },
    }));
  },
  
  updateBasicInfo: (info) => {
    set((state) => ({
      testCreation: {
        ...state.testCreation,
        basicInfo: { ...state.testCreation.basicInfo, ...info },
      },
    }));
  },
  
  addMCQQuestion: (question) => {
    set((state) => ({
      testCreation: {
        ...state.testCreation,
        selectedMCQs: [...state.testCreation.selectedMCQs, question],
      },
    }));
  },
  
  removeMCQQuestion: (id) => {
    set((state) => ({
      testCreation: {
        ...state.testCreation,
        selectedMCQs: state.testCreation.selectedMCQs.filter((q) => q.id !== id),
      },
    }));
  },
  
  addCodingQuestion: (question) => {
    set((state) => ({
      testCreation: {
        ...state.testCreation,
        selectedCoding: [...state.testCreation.selectedCoding, question],
      },
    }));
  },
  
  removeCodingQuestion: (id) => {
    set((state) => ({
      testCreation: {
        ...state.testCreation,
        selectedCoding: state.testCreation.selectedCoding.filter((q) => q.id !== id),
      },
    }));
  },
  
  addAssignment: (assignment) => {
    set((state) => ({
      testCreation: {
        ...state.testCreation,
        assignments: [...state.testCreation.assignments, assignment],
      },
    }));
  },
  
  removeAssignment: (candidateId) => {
    set((state) => ({
      testCreation: {
        ...state.testCreation,
        assignments: state.testCreation.assignments.filter((a) => a.candidateId !== candidateId),
      },
    }));
  },
  
  resetCreation: () => {
    set({ testCreation: initialCreationState });
  },
  
  createAssignment: (assignment) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: `assign-${Date.now()}`,
    };
    set((state) => ({
      assignments: [...state.assignments, newAssignment],
    }));
  },
  
  updateAssignment: (id, updates) => {
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  },
}));

// Export mock data for use in components
export const availableMCQs = mockMCQs;
export const availableCodingQuestions = mockCodingQuestions;
