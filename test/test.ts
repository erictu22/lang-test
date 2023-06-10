import request from 'supertest';
import app from '../src/index';

describe('POST /', () => {
  it('should return a greeting with name and age', async () => {
    const response = await request(app)
      .post('/')
      .send({ name: 'John', age: 30 });

    expect(response.status).toBe(200);
    expect(response.text).toEqual('Hello John! Your age is 30.');
  });

  it('should return an error for negative age', async () => {
    const response = await request(app)
      .post('/')
      .send({ name: 'John', age: -10 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid age. Age must be a positive number.' });
  });

  it('should return an error for non-numeric age', async () => {
    const response = await request(app)
      .post('/')
      .send({ name: 'John', age: 'thirty' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid age. Age must be a positive number.' });
  });
});
