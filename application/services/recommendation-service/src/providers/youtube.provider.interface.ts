import { YouTubeVideoDto } from '@foodlens/shared-types';

export interface YouTubeProvider {
  searchVideos(query: string, maxResults?: number): Promise<YouTubeVideoDto[]>;
}
