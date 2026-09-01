import { Injectable } from '@nestjs/common';
import { YouTubeProvider } from './youtube.provider.interface';
import { YouTubeVideoDto } from '@foodlens/shared-types';
import { loadAppConfig } from '@foodlens/shared-config';
import { StructuredLogger } from '@foodlens/shared-utils';
import axios from 'axios';

@Injectable()
export class YouTubeApiProvider implements YouTubeProvider {
  private logger = new StructuredLogger('recommendation-service:youtube-api');
  private config = loadAppConfig();

  async searchVideos(query: string, maxResults = 3): Promise<YouTubeVideoDto[]> {
    const apiKey = this.config.youtubeApiKey;
    if (!apiKey) {
      this.logger.warn('YOUTUBE_API_KEY is missing. Falling back to default provider.');
      throw new Error('YOUTUBE_API_KEY environment variable missing');
    }

    try {
      this.logger.info(`Searching YouTube API for query: ${query}`);

      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: apiKey,
          q: `${query} healthy recipe nutrition`,
          type: 'video',
          part: 'snippet',
          maxResults,
          relevanceLanguage: 'en',
        },
        timeout: 10000,
      });

      const items = response.data?.items || [];
      const videoMap = new Map<string, YouTubeVideoDto>();

      for (const item of items) {
        const vId = item.id?.videoId;
        if (vId && !videoMap.has(vId)) {
          videoMap.set(vId, {
            videoId: vId,
            title: item.snippet?.title || 'Food & Nutrition Video',
            channelTitle: item.snippet?.channelTitle || 'Culinary Channel',
            description: item.snippet?.description || '',
            thumbnailUrl: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
            publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
            url: `https://www.youtube.com/watch?v=${vId}`,
          });
        }
      }

      return Array.from(videoMap.values());
    } catch (err: any) {
      this.logger.error('YouTube API call failed or quota exceeded', err);
      throw err;
    }
  }
}
