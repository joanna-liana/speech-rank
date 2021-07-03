import { Conference } from './Conference';

export class Year {
    #year: string;
    #conferences: Conference[] = [];

    constructor(year: string) {
      this.#year = year;
    }

    get year(): string {
      return this.#year;
    }

    get conferences(): Conference[] {
      return this.#conferences;
    }

    addConference(conf: Conference): null {
      this.#conferences = this.#conferences.concat(conf);
      //TODO what to return here?
      return null;
    }
}
