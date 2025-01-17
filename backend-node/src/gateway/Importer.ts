import { youtube_v3 } from 'googleapis';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';

export type PlaylistItemListFetcher = (params: youtube_v3.Params$Resource$Playlistitems$List) => GaxiosPromise<youtube_v3.Schema$PlaylistItemListResponse>;

export interface VideoData {
    videoId: string;
    title: string;
    description: string;
}

export class Importer {
    #apiKey: string;
    #playlistItemListFetcher: PlaylistItemListFetcher

    #NUMBER_OF_VIDEOS_RETURNED = 25;

    constructor(
      apiKey: string,
      playlistItemListFetcher: PlaylistItemListFetcher,
    ) {
      this.#playlistItemListFetcher = playlistItemListFetcher;
      this.#apiKey = apiKey;
    }


    async importFromYouTubePlaylist(playlistId: string): Promise<VideoData[]> {
      let videos: VideoData[] = [];
      try {

        // Define the API request for retrieving search results.
        const playlistitems = this.#playlistItemListFetcher({
          maxResults: this.#NUMBER_OF_VIDEOS_RETURNED,
          playlistId: playlistId,
          key: this.#apiKey,
          part: ['contentDetails','snippet'],

        });


        const response = await playlistitems;
        const items = response.data.items;

        if (items != null) {
          videos = items.map(item => ({
            description: item.snippet?.description || '',
            title: item.snippet?.title || '',
            videoId: item.contentDetails!.videoId!
          }));
        }
        return videos;
      } catch (error) {
        console.error('There was an error', error);
      }

      return videos;
    }

    importConfitura2019(): Promise<VideoData[]> {
      return this.importFromYouTubePlaylist('PLVbNBx5Phg3AwVti8rYNqx7965pgfMZWO');
    }

    importConfitura2018(): Promise<VideoData[]> {
      return this.importFromYouTubePlaylist('PLVbNBx5Phg3DkJO00oMB2ETHFmG7RUujm');
    }

    importBoilingFrogs2019(): Promise<VideoData[]> {
      return this.importFromYouTubePlaylist('PLVT0blg4rCWCUv3oEMQ12haQkMQ1drefo');
    }

    importBoilingFrogs2018(): Promise<VideoData[]> {
      return this.importFromYouTubePlaylist('PLVT0blg4rCWCEPTY20ZrZeGNQUD_2khrE');
    }

    importScalar2019(): Promise<VideoData[]> {
      return this.importFromYouTubePlaylist('PL8NC5lCgGs6MYG0hR_ZOhQLvtoyThURka');
    }

    importDevConf2019(): Promise<VideoData[]> {
      return this.importFromYouTubePlaylist('PL8BUDiR2Y8Ys3DHzQhws4BZng8DjvEwib');
    }

    importDevConf2017(): Promise<VideoData[]> {
      return this.importFromYouTubePlaylist('PL8BUDiR2Y8Yu3SFzqhRWqDrF9OdejbeV0');
    }
}
