// backend/src/server.ts
import createServer from './app';
import config from './config/config';
import logger from './utils/logger';

const server = createServer();
const port = config.port;

server.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});