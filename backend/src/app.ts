import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorMiddleware);

export default app;
