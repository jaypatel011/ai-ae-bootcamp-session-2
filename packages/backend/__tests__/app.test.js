const request = require('supertest');
const app = require('../src/app');
const { closeDatabase } = require('../src/utils/database');

// Close the database connection after all tests
afterAll(() => {
  closeDatabase();
});

// Test helpers
const createTask = async (title = 'Test Task') => {
  const response = await request(app)
    .post('/api/tasks')
    .send({ title })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('API Endpoints', () => {
  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Check if tasks have the expected structure (when tasks exist)
      if (response.body.length > 0) {
        const task = response.body[0];
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('createdAt');
      }
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const newTask = { title: 'Test Task' };
      const response = await request(app)
        .post('/api/tasks')
        .send(newTask)
        .set('Accept', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newTask.title);
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete an existing task', async () => {
      const task = await createTask('Task To Be Deleted');

      const deleteResponse = await request(app).delete(`/api/tasks/${task.id}`);
      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body).toHaveProperty('message');
      expect(deleteResponse.body).toHaveProperty('id');

      // Verify it's deleted
      const getAgain = await request(app).get(`/api/tasks/${task.id}`);
      expect(getAgain.status).toBe(404);
    });

    it('should return 404 when task does not exist', async () => {
      const response = await request(app).delete('/api/tasks/non-existent-id');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});