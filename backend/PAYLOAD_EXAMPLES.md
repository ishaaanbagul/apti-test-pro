# API Payload Examples

## 1. Create Test with Questions

### POST /api/v1/tests/

```json
{
  "test_name": "Full Stack Developer Assessment",
  "duration_minutes": 90,
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DRAFT",
  "existing_questions": [
    {
      "question_id": "660e8400-e29b-41d4-a716-446655440001",
      "question_type": "MCQ",
      "order_index": 0
    },
    {
      "question_id": "660e8400-e29b-41d4-a716-446655440002",
      "question_type": "CODING",
      "order_index": 1
    }
  ],
  "new_mcqs": [
    {
      "question_text": "What is the time complexity of binary search?",
      "option_a": "O(n)",
      "option_b": "O(log n)",
      "option_c": "O(n²)",
      "option_d": "O(1)",
      "correct_answer": "B",
      "difficulty_level": "easy",
      "language": "javascript",
      "order_index": 2
    }
  ],
  "new_coding_questions": [
    {
      "title": "Two Sum",
      "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      "difficulty": "easy",
      "labels": ["arrays", "hash-table"],
      "sample_input": "[2,7,11,15], 9",
      "sample_output": "[0,1]",
      "constraints": "2 <= nums.length <= 10^4",
      "order_index": 3
    }
  ]
}
```

### Response:
```json
{
  "test_id": "770e8400-e29b-41d4-a716-446655440000",
  "test_name": "Full Stack Developer Assessment",
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "duration_minutes": 90,
  "status": "DRAFT",
  "created_at": "2024-12-10T10:30:00Z",
  "questions": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440001",
      "question_id": "660e8400-e29b-41d4-a716-446655440001",
      "question_type": "MCQ",
      "order_index": 0,
      "question_text": "What is React?",
      "difficulty_level": "easy"
    }
  ],
  "mcq_details": [...],
  "coding_details": [...]
}
```

---

## 2. Create Test (Basic Info Only)

### POST /api/v1/tests/

```json
{
  "test_name": "JavaScript Basics",
  "duration_minutes": 60,
  "created_by": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DRAFT"
}
```

---

## 3. Add Questions to Existing Test

### POST /api/v1/tests/{test_id}/questions

```json
{
  "existing_questions": [
    {
      "question_id": "660e8400-e29b-41d4-a716-446655440005",
      "question_type": "MCQ"
    }
  ],
  "new_mcqs": [
    {
      "question_text": "Which data structure uses FIFO principle?",
      "option_a": "Stack",
      "option_b": "Queue",
      "option_c": "Array",
      "option_d": "Tree",
      "correct_answer": "B",
      "difficulty_level": "easy"
    }
  ],
  "new_coding_questions": [
    {
      "title": "Reverse String",
      "description": "Write a function that reverses a string.",
      "difficulty": "easy",
      "labels": ["strings", "two-pointers"],
      "sample_input": "hello",
      "sample_output": "olleh",
      "constraints": "1 <= s.length <= 10^5"
    }
  ]
}
```

---

## 4. Create New MCQ (Standalone)

### POST /api/v1/questions/mcq

```json
{
  "question_text": "What does SQL stand for?",
  "option_a": "Structured Query Language",
  "option_b": "Simple Query Language",
  "option_c": "Standard Query Language",
  "option_d": "Server Query Language",
  "correct_answer": "A",
  "difficulty_level": "easy",
  "language": "sql"
}
```

### Response:
```json
{
  "mcq_id": "990e8400-e29b-41d4-a716-446655440000",
  "question_text": "What does SQL stand for?",
  "option_a": "Structured Query Language",
  "option_b": "Simple Query Language",
  "option_c": "Standard Query Language",
  "option_d": "Server Query Language",
  "correct_answer": "A",
  "difficulty_level": "easy",
  "language": "sql"
}
```

---

## 5. Create New Coding Question (Standalone)

### POST /api/v1/questions/coding

```json
{
  "title": "Valid Parentheses",
  "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
  "difficulty": "medium",
  "labels": ["stack", "strings"],
  "sample_input": "()[]{}",
  "sample_output": "true",
  "constraints": "1 <= s.length <= 10^4"
}
```

### Response:
```json
{
  "id": 1,
  "title": "Valid Parentheses",
  "description": "Given a string s containing just the characters...",
  "difficulty": "medium",
  "labels": ["stack", "strings"],
  "sample_input": "()[]{}",
  "sample_output": "true",
  "constraints": "1 <= s.length <= 10^4"
}
```

---

## 6. List Tests with Filters

### GET /api/v1/tests/?page=1&page_size=10&status=DRAFT

### Response:
```json
{
  "tests": [
    {
      "test_id": "770e8400-e29b-41d4-a716-446655440000",
      "test_name": "Full Stack Developer Assessment",
      "created_by": "550e8400-e29b-41d4-a716-446655440000",
      "duration_minutes": 90,
      "status": "DRAFT",
      "created_at": "2024-12-10T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10
}
```

---

## 7. List MCQ Questions

### GET /api/v1/questions/mcq?difficulty=easy&language=javascript&search=array

### Response:
```json
{
  "questions": [
    {
      "mcq_id": "990e8400-e29b-41d4-a716-446655440000",
      "question_text": "Which method adds elements to the end of an array?",
      "option_a": "push()",
      "option_b": "pop()",
      "option_c": "shift()",
      "option_d": "unshift()",
      "correct_answer": "A",
      "difficulty_level": "easy",
      "language": "javascript"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

---

## 8. List Coding Questions

### GET /api/v1/questions/coding?difficulty=medium&labels=arrays,hash-table

### Response:
```json
{
  "questions": [
    {
      "id": 1,
      "title": "Two Sum",
      "description": "Given an array of integers...",
      "difficulty": "medium",
      "labels": ["arrays", "hash-table"],
      "sample_input": "[2,7,11,15], 9",
      "sample_output": "[0,1]",
      "constraints": "2 <= nums.length <= 10^4"
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 20
}
```

---

## 9. Update Test

### PUT /api/v1/tests/{test_id}

```json
{
  "test_name": "Updated Test Name",
  "duration_minutes": 120,
  "status": "ACTIVE"
}
```

---

## 10. Remove Question from Test

### DELETE /api/v1/tests/{test_id}/questions/{question_id}

Returns 204 No Content on success.

---

## How unified_questions and MongoDB Integrate

### Architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                         PostgreSQL                               │
├─────────────────────────────────────────────────────────────────┤
│  mcq_questions          │  unified_questions    │  tests        │
│  ───────────────        │  ─────────────────    │  ─────        │
│  mcq_id (PK)            │  question_id (PK)     │  test_id (PK) │
│  question_text     ──►  │  source_id ◄──        │  test_name    │
│  option_a-d             │  type (MCQ/CODING)    │  duration     │
│  correct_answer         │  question_text        │               │
│  difficulty_level       │  difficulty_level     │               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ source_id references
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                          MongoDB                                 │
├─────────────────────────────────────────────────────────────────┤
│  coding_questions                                               │
│  ─────────────────                                              │
│  id (int)  ◄── source_id converted via UUID5                    │
│  title                                                          │
│  description                                                    │
│  difficulty                                                     │
│  labels[]                                                       │
│  sample_input/output                                            │
│  constraints                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Flow:

1. **MCQ Created**: 
   - Insert into `mcq_questions` → get `mcq_id`
   - Insert into `unified_questions` with `source_id = mcq_id`, `type = MCQ`

2. **Coding Question Created**:
   - Insert into MongoDB `coding_questions` → get `id` (int)
   - Convert to UUID: `uuid5(NAMESPACE_DNS, str(id))`
   - Insert into `unified_questions` with `source_id = converted_uuid`, `type = CODING`

3. **Attach to Test**:
   - Insert into `test_questions` with `question_id` from `unified_questions`

4. **Retrieve Test**:
   - Join `tests` → `test_questions` → `unified_questions`
   - For MCQs: fetch from `mcq_questions` using `source_id`
   - For Coding: fetch from MongoDB using reverse UUID5 lookup
