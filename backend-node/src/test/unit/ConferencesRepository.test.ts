import { v4 } from 'uuid';

import { ConferencesRepository } from '../../ConferencesRepository';
import { ConferenceDto } from '../../dto/ConferenceDto';
import { ConferenceImportDto } from '../../dto/ConferenceImportDto';
import { Comment } from '../../entity/Comment';
import { Conference } from '../../entity/Conference';
import { Presentation } from '../../entity/Presentation';
import { Rate } from '../../entity/Rate';
import { Importer, PlaylistItemListFetcher } from '../../gateway/Importer';
import { samplePlaylistItems } from './playlistItemsResponses';

describe('Conferences repository', () => {
  jest.spyOn(console, 'log').mockImplementation(() => null as any);

  const getRepo = (customPlaylistFetcher?: PlaylistItemListFetcher): ConferencesRepository => {
    const playlistItemListFetcher: PlaylistItemListFetcher = customPlaylistFetcher || jest.fn().mockResolvedValue(samplePlaylistItems);

    const importer = new Importer('apiKey', playlistItemListFetcher);
    return new ConferencesRepository(importer);
  };

  const ensureExistingConf = async (repo: ConferencesRepository): Promise<string> => {
    const conf: ConferenceImportDto = {
      name: 'Another Best Conference Ever',
      playlistLink: 'ABC',
      year: '2010'
    };

    return repo.importConference(conf);
  };

  describe('Conference import', () => {
    const conf: ConferenceImportDto = {
      name: 'The Best Conference Ever',
      playlistLink: 'XYZ',
      year: '2021'
    };

    it('Imports the given conference', async() => {
      // given
      const repo = getRepo();

      // when
      const confId = await repo.importConference(conf);

      // then
      const addedConf = repo.getConference(confId);
      expect(addedConf.name).toBe(conf.name);
      expect(addedConf.presentations).toEqual([{
        comments: [],
        id: expect.any(String),
        link: 'https://youtube.com/embed/R4C_JciDsuo',
        rates: [],
        rating: 0,
        title: 'Venkat Subramaniam - The Art of Simplicity @ DevConf 2017'
      },
      {
        comments: [],
        id: expect.any(String),
        link: 'https://youtube.com/embed/nPxpbpqe1gQ',
        rates: [],
        rating: 0,
        title: 'Irio Musskopf - Using Machine Learning and Open Data to Report 216 Brazilian [..] @ DevConf 2017'
      }]);
    });

    it('Imports the given conference without presentations if the YouTube API errors out', async() => {
      // given
      const playlistItemListFetcher = jest.fn().mockRejectedValue('API error');
      const repo = getRepo(playlistItemListFetcher);

      // when
      const confId = await repo.importConference(conf);

      // then
      const addedConf = repo.getConference(confId);
      expect(addedConf.name).toBe(conf.name);
      expect(addedConf.presentations).toStrictEqual([]);
    });

    it('Adds the imported conference to the list of conferences', async () => {
      // given
      const repo = getRepo();

      // when
      const confId = await repo.importConference(conf);

      // then
      const confInRepo = repo.conferences.find(c => c.id === confId);
      expect(confInRepo).toBeDefined();
    });

    // TODO: this fails and probably shouldn't - missing functionality
    it.skip('Adds the imported conference to the list of years', async () => {
      // given
      const repo = getRepo();

      // when
      const confId = await repo.importConference(conf);

      // then
      const year = repo.years.find(y => y.year === conf.year);
      const yearConference = year.conferences.find(c => c.id === confId);

      expect(yearConference).toBeDefined();
    });
  });

  describe('Conference fetch', () => {
    it('Fetches an existing conference by its ID', async() => {
      // given
      const repo = getRepo();

      const confId = await ensureExistingConf(repo);

      // when
      const conf = repo.getConference(confId);

      // then
      expect(conf).toBeInstanceOf(ConferenceDto);
    });

    it('Throws if the conference does not exist in the repository', async() => {
      // given
      const nonExistentConfId = v4();
      const repo = getRepo();

      // when, then
      expect(() => repo.getConference(nonExistentConfId)).toThrow();
    });
  });

  describe('Comment', () => {
    it('Adds a comment to a given presentation', async() => {
      // given
      const repo = getRepo();

      const confId = await ensureExistingConf(repo);
      const conf = repo.getConference(confId);

      const comment: Comment = {
        comment: 'very informative',
        presentationId: conf.presentations[0].id,
        userId: '123',
        username: 'testUser'
      };

      // when
      repo.add(comment);

      // then
      const confWithComment = repo.getConference(confId);
      expect(confWithComment.presentations[0].comments).toHaveLength(1);
      expect(confWithComment.presentations[0].comments[0]).toMatchObject(comment);
    });

    it('Throws if the presentation to add a comment to does not exist in the repository', async() => {
      // given
      const nonExistentPresentationId = v4();
      const repo = getRepo();

      const comment: Comment = {
        comment: 'very informative',
        presentationId: nonExistentPresentationId,
        userId: '123',
        username: 'testUser'
      };

      // when, then
      expect(() => repo.add(comment)).toThrow();
    });
  });

  describe('Rate', () => {
    it('Adds a rate to a given presentation', async() => {
      // given
      const repo = getRepo();

      const confId = await ensureExistingConf(repo);
      const conf = repo.getConference(confId);

      const rate: Rate = {
        rate: 4,
        presentationId: conf.presentations[0].id,
        userId: '123',
      };

      // when
      repo.add(rate);

      // then
      const confWithComment = repo.getConference(confId);
      expect(confWithComment.presentations[0].rates).toHaveLength(1);
      expect(confWithComment.presentations[0].rates[0]).toMatchObject(rate);
    });

    it('Updates the presentation\'s rating after adding a rate', async() => {
      // given
      const repo = getRepo();

      const confId = await ensureExistingConf(repo);
      const conf = repo.getConference(confId);

      const rate: Rate = {
        rate: 4,
        presentationId: conf.presentations[0].id,
        userId: '123',
      };

      const anotherRate: Rate = {
        rate: 2,
        presentationId: conf.presentations[0].id,
        userId: '123',
      };

      // when
      repo.add(rate);
      repo.add(anotherRate);

      // then
      const confWithComment = repo.getConference(confId);
      expect(confWithComment.presentations[0].rating).toBe(3);
    });

    it('Throws if the presentation to add a rate to does not exist in the repository', async() => {
      // given
      const nonExistentPresentationId = v4();
      const repo = getRepo();

      const rate: Rate = {
        rate: 4,
        presentationId: nonExistentPresentationId,
        userId: '123',
      };

      // when, then
      expect(() => repo.add(rate)).toThrow();
    });
  });

  describe('Adding conference by year', () => {
    const conference: Conference = {
      id: '123',
      name: 'TestConf',
      presentations: [new Presentation({
        videoId: '123',
        title: 'TDD',
        description: 'All things TDD'
      })]
    };

    const existingYear = '2017';

    it('Adds a conference to an existing year', async() => {
      // given
      const repo = getRepo();

      // when
      repo.add(existingYear, conference);

      // then
      const yearWithConf = repo.years.find(y => y.year === existingYear);
      const addedYearConf = yearWithConf.conferences.find(c => c.id === conference.id);
      expect(addedYearConf.name).toBe(conference.name);
      expect(addedYearConf.presentations).toBe(conference.presentations.length);

      const addedConf = repo.conferences.find(c => c.id === conference.id);
      expect(addedConf).toBeDefined();
    });

    it('Given the year does not exist, it only updates the conferences list', async() => {
      // given
      const repo = getRepo();
      const year = '2007';

      // when
      repo.add(year, conference);

      // then
      const yearWithConf = repo.years.find(y => y.year === year);
      expect(yearWithConf).toBeUndefined();

      const addedConf = repo.conferences.find(c => c.id === conference.id);
      expect(addedConf).toBeDefined();
    });

    it('When adding the same conference twice, a duplicate is created', () => {
      // given
      const repo = getRepo();

      // when
      repo.add(existingYear, conference);
      repo.add(existingYear, conference);

      // then
      const yearWithConf = repo.years.find(y => y.year === existingYear);
      const addedYearConfs = yearWithConf.conferences.filter(c => c.id === conference.id);
      expect(addedYearConfs).toHaveLength(2);

      const addedConfs = repo.conferences.filter(c => c.id === conference.id);
      expect(addedConfs).toHaveLength(2);
    });
  });

  describe('Adding conference', () => {
    it('Adds a conference with pre-fetched presentations', async() => {
      // given
      const repo = getRepo();

      const confId = await ensureExistingConf(repo);

      // when
      const conf = repo.getConference(confId);

      // then
      expect(conf).toBeInstanceOf(ConferenceDto);
    });

    it('Throws if the conference does not exist in the repository', async() => {
      // given
      const nonExistentConfId = v4();
      const repo = getRepo();

      // when, then
      expect(() => repo.getConference(nonExistentConfId)).toThrow();
    });
  });
});
