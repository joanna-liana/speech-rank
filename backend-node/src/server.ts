import { config } from 'dotenv';

import { getApp } from './app';
import { ConferencesRepository } from './ConferencesRepository';

config();

const bootstrap = async (): Promise<void> => {
  const port = 3000;

  (await getApp(new ConferencesRepository(process.env.YOUTUBE_API_KEY!)))
    .listen(port, () => console.log(`App listening on port ${port}!`));
};

process.on('unhandledRejection', (error) => {
  console.log('unhandledRejection', error);
});

bootstrap();
