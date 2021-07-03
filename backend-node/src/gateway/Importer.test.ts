import { config } from 'dotenv';

import { Importer } from './Importer';

config();

describe('Importer', () => {
  it('imports conference data', async () => {
    // given
    const apiKey = process.env.YOUTUBE_API_KEY as string;

    // when, then
    (await (new Importer(apiKey)).importBoilingFrogs2019()).forEach(console.log);
  });
});
