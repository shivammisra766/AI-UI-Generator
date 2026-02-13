import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import planRoutes from './routes/planRoutes.js';
import errorHandler from './middleware/errorMiddleware.js';

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI UI Generator API is running 🚀");
});

app.use("/plan", planRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
