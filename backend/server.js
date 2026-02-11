import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import cors from 'cors';
import planRoutes from './routes/planRoutes.js';
import errorHander from './middleware/errorMiddleware.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/plan", planRoutes);

app.use(errorHander);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});