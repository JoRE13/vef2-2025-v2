import { environment } from './lib/enviroment.js';
import { logger } from './lib/logger.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import session from 'express-session';
import { isInvalid } from './lib/is-invalid.js';
import { indexRouter } from './routes/index-routes.js';
import { handler404, handlerError } from './lib/handlers.js';
import { shuffleArray } from './lib/helper.js';

const env = environment(process.env, logger);

if (!env) {
  process.exit(1);
}

const { port, sessionSecret } = env;
const path = dirname(fileURLToPath(import.meta.url));

const sessionOptions = {
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
};

const app = express();

app.set('views', join(path, './views'));
app.set('view engine', 'ejs');

app.locals = {
  isInvalid,
  shuffleArray,
};

app.use(express.urlencoded({ extended: true }));
app.use(session(sessionOptions));

app.use('/', indexRouter);
app.use(express.static(join(path, '../public')));
app.use(handler404);
app.use(handlerError);

const server = app.listen(port, () => {
  console.info(`🚀 Server running at http://localhost:${port}/`);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 shutting down');
  server.close((e) => {
    if (e) {
      logger.error('error closing server', { error: e });
    }
  });

  if (!(await getDatabase()?.close())) {
    logger.error('error closing database connection');
  }
});
