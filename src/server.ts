import express from 'express';
import { router as homeRoute } from './routes/home';

async function main() {
  const app = express();
  const PORT = process.env.PORT || 5678;

  app.use('/', homeRoute);

  app.listen(PORT, () => {
    console.info(`Server ready at port ${PORT}`);
  });
}

main().catch(console.error);
