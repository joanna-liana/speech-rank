import cors from 'cors';
import express, { json, Request, Response } from 'express';

import { ConferencesRepository } from './ConferencesRepository';
import { ConferenceImportDto } from './dto/ConferenceImportDto';
import { Comment } from './entity/Comment';
import { Rate } from './entity/Rate';

export const getApp = async (conferencesRepo: ConferencesRepository): Promise<express.Application> => {
  const app = express();

  await conferencesRepo.importAllConferences();

  const options = 'GET /api/conferences<br/>' +
    'GET /api/conference/:id<br/>' +
    'POST /api/rating<br/>' +
    'POST /api/comment<br/>' +
    'POST /api/import<br/>';

  app.use(cors());
  app.use(json());

  app.get('', (req, res) => res.send(options));

  app.get(
    '/api/conferences',
    (req, res) => {
      const { years } = conferencesRepo;

      return res.json(years);
    }
  );

  app.get(
    '/api/conference/:id',
    (req, res) => {
      return res.json(conferencesRepo.getConference(req.params.id as string));
    }
  );

  app.post(
    '/api/rating',
    (req, res) => {
      const rate: Rate = req.body;
      conferencesRepo.add(rate);
      res.json(rate.rate);
    }
  );

  app.post(
    '/api/comment',
    (req, res) => {
      const comment: Comment = req.body;

      conferencesRepo.add(comment);
      res.json(comment.comment);
    }
  );

  app.post(
    '/api/import',
    async (req, res) => {
      const conf: ConferenceImportDto = req.body;
      const id = await conferencesRepo.importConference(conf);
      res.json(conferencesRepo.getConference(id));
    }
  );


  app.use((req: Request, res: Response) => {
    res.status(404).send(`Not found ${req.path}`);
  });

  app.use((err: Error, _req: Request, res: Response) => {
    console.log(err);
    res.status(500).send(err);
  });

  return app;
};
