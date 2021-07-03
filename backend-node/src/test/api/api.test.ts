import { config } from 'dotenv';
import supertest from 'supertest';
import { v4 } from 'uuid';

import { ConferenceImportDto } from '../../dto/ConferenceImportDto';
import { Comment } from '../../entity/Comment';
import { Rate } from '../../entity/Rate';

config();

const port = process.env.TEST_API_PORT;

describe('API tests', () => {
  const request = supertest(`http://localhost:${port}`);
  const confituraId = '51';
  const confituraKeynoteLink = 'https://youtube.com/embed/iwctfrr7sCw';

  it('GET /api/conferences', async () => {
    const res = await request
      .get('/api/conferences');

    expect(res.body).toHaveLength(3);

    const confs2018 = res.body.find(item => item.year === '2018');
    expect(confs2018.conferences).toHaveLength(2);

    const confitura = confs2018.conferences.find(conf => conf.id === confituraId);
    expect(confitura.name).toBe('Confitura');
    expect(confitura.presentations).toBe(25);
  });

  it('GET /api/conference/:id', async () => {
    const res = await request
      .get(`/api/conference/${confituraId}`);

    expect(res.body.id).toBe(confituraId);
    expect(res.body.name).toBe('Confitura');
    expect(res.body.presentations).toHaveLength(25);

    const keynote = res.body.presentations.find(p => p.link === confituraKeynoteLink);
    expect(keynote.id).toBeDefined();
    expect(keynote.title).toBeDefined();
    expect(keynote.link).toBeDefined();
    expect(keynote.rating).toBe(0);
    expect(keynote.rates).toStrictEqual([]);
    expect(keynote.comments).toStrictEqual([]);
  });

  it('POST /api/rating', async () => {
    // given
    const confituraPresentations = await request
      .get(`/api/conference/${confituraId}`);

    const presentationId = confituraPresentations.body.presentations[0].id;

    const rate: Rate = {
      presentationId,
      rate: 3,
      userId: v4()
    };

    // when
    const res = await request
      .post('/api/rating')
      .send(rate);

    // then
    expect(res.status).toBe(200);
    expect(res.body).toBe(rate.rate);

    const updatedConfituraPresentations = await request
      .get(`/api/conference/${confituraId}`);
    const presentationWithRate = updatedConfituraPresentations.body.presentations[0];

    expect(presentationWithRate.rates.find(r => r.userId === rate.userId)).toStrictEqual(rate);
  });

  it('POST /api/import', async () => {
    // given
    const conf: ConferenceImportDto = {
      name: 'DevTernity',
      playlistLink: 'PLZQDTUIhS27A_qsf8J38xx4LwVEEUfh22',
      year: '2019'
    };

    // when
    const res = await request
      .post('/api/import')
      .send(conf);

    // then
    expect(res.status).toBe(200);
    expect(res.body.id).toBeDefined();

    const uploadedConf = await request
      .get(`/api/conference/${res.body.id}`);
    expect(uploadedConf.body.presentations).toHaveLength(19);
  });

  it('POST /api/comment', async () => {
    // given
    const confituraPresentations = await request
      .get(`/api/conference/${confituraId}`);

    const presentationId = confituraPresentations.body.presentations[0].id;

    const comment: Comment = {
      presentationId,
      userId: v4(),
      comment: 'test comment',
      username: 'Jane Doe'
    };

    // when
    const res = await request
      .post('/api/comment')
      .send(comment);

    // then
    expect(res.status).toBe(200);
    expect(res.body).toBe(comment.comment);

    const updatedConfituraPresentations = await request
      .get(`/api/conference/${confituraId}`);
    const presentationWithComment = updatedConfituraPresentations.body.presentations[0];

    expect(presentationWithComment.comments.find(c => c.userId === comment.userId)).toStrictEqual(comment);
  });
});
