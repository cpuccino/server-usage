import express from 'express';
import { getSysInfo } from './utilities/sysinfo';

async function main() {
  const app = express();
  const PORT = process.env.PORT || 5678;

  app.get('/', (req, res) => res.status(200).send(getSysInfo()));

  app.listen(PORT, () => {
    console.info(`Server ready at port ${PORT}`);
  });
}

main().catch(console.error);
