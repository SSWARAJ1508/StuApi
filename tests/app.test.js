import request from 'supertest';
import app, { resetStudents } from '../src/app.js';

describe('Student API Endpoints', () => {
  beforeEach(() => {
    // Reset data before each test to maintain state isolation
    resetStudents();
  });

  describe('GET /', () => {
    it('should return a welcome message with status 200', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Welcome to the Student API!',
      });
    });
  });

  describe('GET /api/students', () => {
    it('should return all students with status 200', async () => {
      const response = await request(app).get('/api/students');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('name', 'Alice Johnson');
    });
  });

  describe('GET /api/students/:id', () => {
    it('should return a student by existing ID with status 200', async () => {
      const response = await request(app).get('/api/students/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: 1,
        name: 'Alice Johnson',
        age: 20,
        course: 'Computer Science',
      });
    });

    it('should return 404 when student ID does not exist', async () => {
      const response = await request(app).get('/api/students/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        'error',
        'Student with ID 999 not found.'
      );
    });
  });

  describe('POST /api/students', () => {
    it('should create a new student and return status 201', async () => {
      const newStudentPayload = {
        name: 'Charlie Brown',
        age: 21,
        course: 'Cloud Computing',
      };

      const response = await request(app)
        .post('/api/students')
        .send(newStudentPayload);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 3);
      expect(response.body.name).toBe('Charlie Brown');
      expect(response.body.age).toBe(21);
      expect(response.body.course).toBe('Cloud Computing');

      // Verify the new student is persisted in memory
      const getResponse = await request(app).get('/api/students/3');
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe('Charlie Brown');
    });

    it('should return 400 when name is missing or empty', async () => {
      const response = await request(app).post('/api/students').send({
        age: 21,
        course: 'Cloud Computing',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("'name' is required");
    });

    it('should return 400 when age is invalid or missing', async () => {
      const response = await request(app).post('/api/students').send({
        name: 'Charlie Brown',
        age: -5,
        course: 'Cloud Computing',
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("'age' is required");
    });

    it('should return 400 when course is missing or empty', async () => {
      const response = await request(app).post('/api/students').send({
        name: 'Charlie Brown',
        age: 21,
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("'course' is required");
    });
  });

  describe('Handling invalid student IDs', () => {
    it('should return 400 for non-numeric ID on GET /api/students/:id', async () => {
      const response = await request(app).get('/api/students/not-a-number');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Invalid student ID format. ID must be an integer.'
      );
    });

    it('should return 400 for non-numeric ID on DELETE /api/students/:id', async () => {
      const response = await request(app).delete('/api/students/abc');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        'error',
        'Invalid student ID format. ID must be an integer.'
      );
    });
  });

  describe('DELETE /api/students/:id', () => {
    it('should delete an existing student and return status 200', async () => {
      const response = await request(app).delete('/api/students/1');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        'message',
        'Student deleted successfully'
      );
      expect(response.body.student).toHaveProperty('id', 1);

      // Verify student is no longer present
      const getResponse = await request(app).get('/api/students/1');
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when attempting to delete a non-existent student', async () => {
      const response = await request(app).delete('/api/students/999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        'error',
        'Student with ID 999 not found.'
      );
    });
  });
});

