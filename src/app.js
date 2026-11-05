import express from 'express';

const app = express();

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Initial in-memory student dataset
const initialStudents = [
  { id: 1, name: 'Alice Johnson', age: 20, course: 'Computer Science' },
  { id: 2, name: 'Bob Smith', age: 22, course: 'DevOps Engineering' },
];

// In-memory storage for students
let students = [...initialStudents];

/**
 * Helper function to reset in-memory data for deterministic testing
 */
export const resetStudents = () => {
  students = initialStudents.map((student) => ({ ...student }));
};

/**
 * GET /
 * Root welcome endpoint
 */
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Student API!',
  });
});

/**
 * GET /api/students
 * Retrieve all students
 */
app.get('/api/students', (req, res) => {
  res.status(200).json(students);
});

/**
 * GET /api/students/:id
 * Retrieve a single student by ID
 */
app.get('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Validate ID format
  if (Number.isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid student ID format. ID must be an integer.',
    });
  }

  const student = students.find((s) => s.id === id);

  if (!student) {
    return res.status(404).json({
      error: `Student with ID ${id} not found.`,
    });
  }

  return res.status(200).json(student);
});

/**
 * POST /api/students
 * Create a new student
 */
app.post('/api/students', (req, res) => {
  const { name, age, course } = req.body;

  // Basic input validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      error:
        "Validation failed: 'name' is required and must be a non-empty string.",
    });
  }

  const numericAge = Number(age);
  if (age === undefined || Number.isNaN(numericAge) || numericAge <= 0) {
    return res.status(400).json({
      error:
        "Validation failed: 'age' is required and must be a positive number.",
    });
  }

  if (!course || typeof course !== 'string' || course.trim() === '') {
    return res.status(400).json({
      error:
        "Validation failed: 'course' is required and must be a non-empty string.",
    });
  }

  // Generate a new ID based on the highest existing ID
  const newId =
    students.length > 0 ? Math.max(...students.map((s) => s.id)) + 1 : 1;

  const newStudent = {
    id: newId,
    name: name.trim(),
    age: numericAge,
    course: course.trim(),
  };

  students.push(newStudent);

  return res.status(201).json(newStudent);
});

/**
 * DELETE /api/students/:id
 * Delete a student by ID
 */
app.delete('/api/students/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Validate ID format
  if (Number.isNaN(id)) {
    return res.status(400).json({
      error: 'Invalid student ID format. ID must be an integer.',
    });
  }

  const studentIndex = students.findIndex((s) => s.id === id);

  if (studentIndex === -1) {
    return res.status(404).json({
      error: `Student with ID ${id} not found.`,
    });
  }

  const [deletedStudent] = students.splice(studentIndex, 1);

  return res.status(200).json({
    message: 'Student deleted successfully',
    student: deletedStudent,
  });
});

export default app;
