import { Injectable } from '@nestjs/common';
import { YouTubeProvider } from './youtube.provider.interface';
import { YouTubeVideoDto } from '@foodlens/shared-types';

@Injectable()
export class MockYouTubeProvider implements YouTubeProvider {
  async searchVideos(query: string, maxResults = 3): Promise<YouTubeVideoDto[]> {
    const cleanQuery = query.replace(/healthy|recipe|nutrition/gi, '').trim();

    return [
      {
        videoId: `yt_mock_${Math.random().toString(36).substring(2, 8)}`,
        title: `How to Make Healthy & Authentic ${cleanQuery}`,
        channelTitle: 'Culinary & Nutrition Lab',
        description: `Step by step tutorial preparing nutritious ${cleanQuery} with balanced macronutrients.`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
        publishedAt: '2025-05-12',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      },
      {
        videoId: `yt_mock_${Math.random().toString(36).substring(2, 8)}`,
        title: `${cleanQuery} Macro Breakdown & Calorie Control`,
        channelTitle: 'FitEats Daily',
        description: `Detailed nutritional breakdown of ${cleanQuery} including protein synthesis and serving advice.`,
        thumbnailUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=500&auto=format&fit=crop&q=60',
        publishedAt: '2025-07-20',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      },
    ].slice(0, maxResults);
  }
}
