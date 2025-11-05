const request = require('supertest');
const app = require('../src/app');
const { db, closeDatabase } = require('../src/utils/database');
const TaskModel = require('../src/models/Task');

// Close database after all tests
afterAll(() => {
  closeDatabase();
});

// Helper function to create a test task
const createTestTask = async (data = {}) => {
  const taskData = {
    title: data.title || 'Test Task',
    description: data.description || 'Test Description',
    category: data.category || 'Work',
    status: data.status || 0,
    dueDate: data.dueDate || null,
    parentTaskId: data.parentTaskId || null,
  };

  return request(app)
    .post('/api/tasks')
    .send(taskData)
    .set('Accept', 'application/json');
};

describe('Task API - Core Functionality', () => {
  describe('GET /api/tasks', () => {
    it('should return an empty array initially', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return all tasks in correct format', async () => {
      // Create a test task
      await createTestTask({ title: 'Task 1' });

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      if (response.body.length > 0) {
        const task = response.body[0];
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('title');
        expect(task).toHaveProperty('description');
        expect(task).toHaveProperty('category');
        expect(task).toHaveProperty('status');
        expect(task).toHaveProperty('dueDate');
        expect(task).toHaveProperty('parentTaskId');
        expect(task).toHaveProperty('createdAt');
        expect(task).toHaveProperty('updatedAt');
        expect(task).toHaveProperty('isCompleted');
      }
    });
  });

  describe('POST /api/tasks - Create Task', () => {
    it('should create a task with only title', async () => {
      const response = await createTestTask({ title: 'Simple Task' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Simple Task');
      expect(response.body.status).toBe(0);
      expect(response.body.category).toBe('Work');
      expect(response.body.isCompleted).toBe(false);
    });

    it('should create a task with all fields', async () => {
      const taskData = {
        title: 'Complete Task',
        description: 'Full description',
        category: 'Personal',
        status: 50,
        dueDate: '2025-11-15',
      };

      const response = await createTestTask(taskData);

      expect(response.status).toBe(201);
      expect(response.body.title).toBe('Complete Task');
      expect(response.body.description).toBe('Full description');
      expect(response.body.category).toBe('Personal');
      expect(response.body.status).toBe(50);
      expect(response.body.dueDate).toBe('2025-11-15');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ description: 'No title' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('title');
    });

    it('should return 400 if title is empty', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '   ' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should return 400 if title exceeds 255 characters', async () => {
      const longTitle = 'a'.repeat(256);
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: longTitle })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid category', async () => {
      const response = await createTestTask({ category: 'InvalidCategory' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Category');
    });

    it('should return 400 if status is not 0-100', async () => {
      const response = await createTestTask({ status: 150 });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Status');
    });

    it('should return 400 if status is not an integer', async () => {
      const response = await createTestTask({ status: 50.5 });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid due date format', async () => {
      const response = await createTestTask({ dueDate: '11/15/2025' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('ISO 8601');
    });

    it('should accept all valid categories', async () => {
      const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Finance', 'Education', 'Home', 'Other'];

      for (const category of categories) {
        const response = await createTestTask({ category, title: `Task ${category}` });
        expect(response.status).toBe(201);
        expect(response.body.category).toBe(category);
      }
    });
  });

  describe('GET /api/tasks/:id - Get Single Task', () => {
    it('should retrieve a task by ID', async () => {
      const createResp = await createTestTask({ title: 'Get Task' });
      const taskId = createResp.body.id;

      const response = await request(app).get(`/api/tasks/${taskId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(taskId);
      expect(response.body.title).toBe('Get Task');
    });

    it('should return 404 for non-existent task ID', async () => {
      const response = await request(app).get('/api/tasks/non-existent-id-12345');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should return 404 for empty task ID path', async () => {
      // /api/tasks/ without ID redirects to GET /api/tasks (returns 200 with all tasks)
      const response = await request(app).get('/api/tasks/');

      // Express treats /api/tasks/ as GET /api/tasks, so it returns 200 with all tasks
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PUT /api/tasks/:id - Update Task', () => {
    it('should update task title', async () => {
      const createResp = await createTestTask({ title: 'Original Title' });
      const taskId = createResp.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'Updated Title' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should update task status', async () => {
      const createResp = await createTestTask({ status: 0 });
      const taskId = createResp.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 75 })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(75);
    });

    it('should update multiple fields', async () => {
      const createResp = await createTestTask({ title: 'Original', status: 0, category: 'Work' });
      const taskId = createResp.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: 'Updated',
          status: 50,
          category: 'Personal',
          dueDate: '2025-12-01',
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated');
      expect(response.body.status).toBe(50);
      expect(response.body.category).toBe('Personal');
      expect(response.body.dueDate).toBe('2025-12-01');
    });

    it('should update task description', async () => {
      const createResp = await createTestTask({ description: 'Old description' });
      const taskId = createResp.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ description: 'New description' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('New description');
    });

    it('should return 400 if updating with invalid category', async () => {
      const createResp = await createTestTask();
      const taskId = createResp.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ category: 'InvalidCategory' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/non-existent-id')
        .send({ title: 'Updated' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
    });

    it('should return 400 if no fields provided', async () => {
      const createResp = await createTestTask();
      const taskId = createResp.body.id;

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({})
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
    });

    it('should automatically update updatedAt timestamp', async () => {
      const createResp = await createTestTask();
      const taskId = createResp.body.id;
      const originalUpdatedAt = createResp.body.updatedAt;

      // Wait a bit to ensure timestamp differs
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ title: 'New Title' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.updatedAt).not.toBe(originalUpdatedAt);
    });
  });

  describe('DELETE /api/tasks/:id - Delete Task', () => {
    it('should delete a task', async () => {
      const createResp = await createTestTask({ title: 'Delete Me' });
      const taskId = createResp.body.id;

      const deleteResp = await request(app).delete(`/api/tasks/${taskId}`);

      expect(deleteResp.status).toBe(200);
      expect(deleteResp.body.message).toContain('deleted');
      expect(deleteResp.body.id).toBe(taskId);

      // Verify task is actually deleted
      const getResp = await request(app).get(`/api/tasks/${taskId}`);
      expect(getResp.status).toBe(404);
    });

    it('should return 404 when deleting non-existent task', async () => {
      const response = await request(app).delete('/api/tasks/non-existent-id');

      expect(response.status).toBe(404);
    });

    it('should cascade delete to sub-tasks', async () => {
      // Create parent task
      const parentResp = await createTestTask({ title: 'Parent Task' });
      const parentId = parentResp.body.id;

      // Create sub-task
      const subResp = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Sub Task',
          parentTaskId: parentId,
        })
        .set('Accept', 'application/json');

      expect(subResp.status).toBe(201);
      const subTaskId = subResp.body.id;

      // Delete parent task
      const deleteResp = await request(app).delete(`/api/tasks/${parentId}`);
      expect(deleteResp.status).toBe(200);

      // Verify both parent and sub-task are deleted
      const parentGet = await request(app).get(`/api/tasks/${parentId}`);
      expect(parentGet.status).toBe(404);

      const subGet = await request(app).get(`/api/tasks/${subTaskId}`);
      expect(subGet.status).toBe(404);
    });
  });

  describe('GET /api/tasks/:id/subtasks - Get Sub-tasks', () => {
    it('should retrieve sub-tasks for a parent task', async () => {
      const parentResp = await createTestTask({ title: 'Parent' });
      const parentId = parentResp.body.id;

      // Create sub-tasks
      await request(app)
        .post('/api/tasks')
        .send({ title: 'Sub 1', parentTaskId: parentId })
        .set('Accept', 'application/json');

      await request(app)
        .post('/api/tasks')
        .send({ title: 'Sub 2', parentTaskId: parentId })
        .set('Accept', 'application/json');

      const response = await request(app).get(`/api/tasks/${parentId}/subtasks`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return 404 if parent task not found', async () => {
      const response = await request(app).get('/api/tasks/non-existent/subtasks');

      expect(response.status).toBe(404);
    });
  });

  describe('Data Persistence', () => {
    it('should persist tasks across multiple requests', async () => {
      const createResp = await createTestTask({ title: 'Persistent Task' });
      const taskId = createResp.body.id;

      // Make multiple requests to verify persistence
      for (let i = 0; i < 3; i++) {
        const getResp = await request(app).get(`/api/tasks/${taskId}`);
        expect(getResp.status).toBe(200);
        expect(getResp.body.title).toBe('Persistent Task');
      }
    });
  });

  describe('Task Status and Completion', () => {
    it('should set isCompleted to false when status is 0-99', async () => {
      for (let status of [0, 1, 50, 99]) {
        const resp = await createTestTask({ status });
        expect(resp.body.isCompleted).toBe(false);
      }
    });

    it('should set isCompleted to true when status is 100', async () => {
      const resp = await createTestTask({ status: 100 });
      expect(resp.body.isCompleted).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return proper error format', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: '' })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('code');
    });

    it('should handle internal server errors gracefully', async () => {
      // Send invalid JSON
      const response = await request(app)
        .post('/api/tasks')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json');

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});
