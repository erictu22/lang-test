import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

// Parse JSON bodies
app.use(express.json());

app.post('/', (req: Request, res: Response) => {
  const { name, age } = req.body;

  // Check if age is a positive number
  if (typeof age !== 'number' || age < 0) {
    return res.status(400).json({ error: 'Invalid age. Age must be a positive number.' });
  }

  return res.status(200).json({text: `Hello ${name}! Your age is ${age}.`});
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
