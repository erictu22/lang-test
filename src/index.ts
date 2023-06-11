import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

app.post("/", (req: Request, res: Response) => {
  const { name, age } = req.body;

  if (typeof age !== "number" || age < 0) {
    return res
      .status(400)
      .json({ error: "Invalid age. Age must be a positive number." });
  }

  res.send(`Hello ${name}! Your age is ${age}.`);
});

export default app;
