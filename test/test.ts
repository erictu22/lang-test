import request from 'supertest';
import express, { Request, Response } from 'express';

const app = express();

app.use(express.json());

app.post('/', (req: Request, res: Response) => {
  const { name, age } = req.body;

  if (typeof age !== 'number' || age < 0) {
    return res.status(400).json({ error: 'Invalid age. Age must be a positive number.' });
  }

  res.send(`Hello ${name}! Your age is ${age}.`);
});

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
