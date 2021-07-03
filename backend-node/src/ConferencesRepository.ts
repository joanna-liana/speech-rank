import { v4 } from 'uuid';

import { ConferenceDto } from './dto/ConferenceDto';
import { ConferenceImportDto } from './dto/ConferenceImportDto';
import { YearDto } from './dto/YearDto';
import { Comment } from './entity/Comment';
import { Conference } from './entity/Conference';
import { Presentation } from './entity/Presentation';
import { Rate } from './entity/Rate';
import { Year } from './entity/Year';
import { Importer } from './gateway/Importer';

export class ConferencesRepository {
    #importer: Importer;
    #conferences: Conference[] = [];
    #years: Year[];

    get conferences(): Conference[] {
      return this.#conferences;
    }

    get years(): YearDto[] {
      return this.#years.map(y => new YearDto(y));
    }

    constructor(apiKey: string) {
      this.#importer = new Importer(apiKey);
      this.#years = [new Year('2019'), new Year('2018'), new Year('2017')];
    }

    add(rate: Rate): void;
    add(comment: Comment): void;
    add(year: string, conf: Conference): void;

    add(param1: Rate | Comment | string, conf?: Conference): void {
      const rate = param1 as Rate;
      if (rate.rate) {
        console.log('Rate added: ' + JSON.stringify(rate));

        const presentation = this.#conferences
          .flatMap(c => c.presentations)
          .find(prez => prez.id === rate.presentationId)!;

        presentation.addRate(rate);

        return;
      }

      const comment = param1 as Comment;
      if (comment.comment) {
        console.log('Comment added: ' + JSON.stringify(comment));

        this.#conferences
          .flatMap(c => c.presentations)
          .find(prez => prez.id === comment.presentationId)!
          .addComment(comment);

        return;
      }


      console.log('Conference added: ' + JSON.stringify(conf));
      this.#conferences = this.#conferences.concat(conf!);
      this.#years.filter(y => y.year === param1)
        .forEach(y => y.addConference(conf!));
    }

    getConference(id: string): ConferenceDto {
      //TODO what to return whe conference not found?
      return new ConferenceDto(this.#conferences.find(conf => conf.id === id)!);
    }

    async importAllConferences(): Promise<void> {
      this.add('2017', {
        id: '11',
        name: 'DevConf',
        presentations: (await this.#importer.importDevConf2017()).map(p => new Presentation(p))
      });
      this.add('2019', {
        id: '12',
        name: 'DevConf',
        presentations: (await this.#importer.importDevConf2019()).map(p => new Presentation(p))
      });
      this.add('2018', {
        id: '21',
        name: 'Boiling Frogs',
        presentations: (await this.#importer.importBoilingFrogs2018()).map(p => new Presentation(p))
      });
      this.add('2019', {
        id: '31',
        name: 'Boiling Frogs',
        presentations: (await this.#importer.importBoilingFrogs2019()).map(p => new Presentation(p))
      });
      this.add('2019', {
        id: '41',
        name: 'Scalar',
        presentations: (await this.#importer.importScalar2019()).map(p => new Presentation(p))
      });
      this.add('2018', {
        id: '51',
        name: 'Confitura',
        presentations: (await this.#importer.importConfitura2018()).map(p => new Presentation(p))
      });
      this.add('2019', {
        id: '51',
        name: 'Confitura',
        presentations: (await this.#importer.importConfitura2019()).map(p => new Presentation(p))
      });
    }

    async importConference(conf: ConferenceImportDto): Promise<string> {
      const id = v4();
      const conference: Conference = {
        id,
        name: conf.name,
        presentations: (await this.#importer.importFromYouTubePlaylist(conf.playlistLink))
          .map(p => new Presentation(p))
      };

      this.add(conf.year, conference);

      return id;
    }

}
