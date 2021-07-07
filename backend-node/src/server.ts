import { config } from 'dotenv';

import { getApp } from './app';

config();

const bootstrap = async (): Promise<void> => {
  const port = process.env.TEST_API_PORT || 3000;

  (await getApp())
    .listen(port, () => console.log(`App listening on port ${port}!`));
};

process.on('unhandledRejection', (error) => {
  console.log('unhandledRejection', error);
});

bootstrap();
