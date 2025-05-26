// FlickNet YouTube Service
// Service for interacting with YouTube Data API v3

const axios = require('axios');

class YouTubeService {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseURL = process.env.YOUTUBE_BASE_URL || 'https://www.googleapis.com/youtube/v3';
    
    if (!this.apiKey) {
      console.warn('⚠️ YouTube API key not found. YouTube features will be disabled.');
      this.enabled = false;
      return;
    }
    
    this.enabled = true;
    
    // Configure axios instance
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      params: {
        key: this.apiKey
      }
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('YouTube API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Search for movie trailers on YouTube
   * @param {string} movieTitle - Movie title to search for
   * @param {number} year - Release year (optional)
   * @param {number} maxResults - Maximum number of results (default: 5)
   * @returns {Promise<Array>} Array of video objects
   */
  async searchMovieTrailers(movieTitle, year = null, maxResults = 5) {
    if (!this.enabled) {
      throw new Error('YouTube service is not enabled');
    }

    try {
      // Build search query
      let searchQuery = `${movieTitle} trailer`;
      if (year) {
        searchQuery += ` ${year}`;
      }

      const response = await this.api.get('/search', {
        params: {
          part: 'snippet',
          q: searchQuery,
          type: 'video',
          maxResults,
          order: 'relevance',
          videoDefinition: 'high',
          videoDuration: 'medium' // Exclude very short clips
        }
      });

      return response.data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`,
        isOfficial: this.isOfficialTrailer(item.snippet.title, item.snippet.channelTitle)
      }));
    } catch (error) {
      console.error('Error searching movie trailers:', error);
      throw error;
    }
  }

  /**
   * Get video details by video ID
   * @param {string} videoId - YouTube video ID
   * @returns {Promise<Object>} Video details
   */
  async getVideoDetails(videoId) {
    if (!this.enabled) {
      throw new Error('YouTube service is not enabled');
    }

    try {
      const response = await this.api.get('/videos', {
        params: {
          part: 'snippet,statistics,contentDetails',
          id: videoId
        }
      });

      if (response.data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = response.data.items[0];
      return {
        videoId: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default.url,
        publishedAt: video.snippet.publishedAt,
        channelTitle: video.snippet.channelTitle,
        duration: video.contentDetails.duration,
        viewCount: parseInt(video.statistics.viewCount),
        likeCount: parseInt(video.statistics.likeCount || 0),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        embedUrl: `https://www.youtube.com/embed/${video.id}`
      };
    } catch (error) {
      console.error('Error getting video details:', error);
      throw error;
    }
  }

  /**
   * Find the best trailer for a movie
   * @param {string} movieTitle - Movie title
   * @param {number} year - Release year
   * @returns {Promise<Object|null>} Best trailer or null if not found
   */
  async findBestTrailer(movieTitle, year) {
    if (!this.enabled) {
      return null;
    }

    try {
      const trailers = await this.searchMovieTrailers(movieTitle, year, 10);
      
      if (trailers.length === 0) {
        return null;
      }

      // Prioritize official trailers
      const officialTrailer = trailers.find(trailer => trailer.isOfficial);
      if (officialTrailer) {
        return officialTrailer;
      }

      // Return the first result if no official trailer found
      return trailers[0];
    } catch (error) {
      console.error('Error finding best trailer:', error);
      return null;
    }
  }

  /**
   * Check if a video appears to be an official trailer
   * @param {string} title - Video title
   * @param {string} channelTitle - Channel title
   * @returns {boolean} True if appears to be official
   */
  isOfficialTrailer(title, channelTitle) {
    const officialKeywords = [
      'official trailer',
      'official teaser',
      'official clip',
      'official video'
    ];

    const officialChannels = [
      'sony pictures',
      'warner bros',
      'universal pictures',
      'paramount pictures',
      'disney',
      'marvel',
      'dc',
      'fox',
      '20th century',
      'lionsgate',
      'mgm',
      'netflix',
      'amazon prime',
      'hulu'
    ];

    const titleLower = title.toLowerCase();
    const channelLower = channelTitle.toLowerCase();

    // Check for official keywords in title
    const hasOfficialKeywords = officialKeywords.some(keyword => 
      titleLower.includes(keyword)
    );

    // Check for official channel names
    const isOfficialChannel = officialChannels.some(channel => 
      channelLower.includes(channel)
    );

    return hasOfficialKeywords || isOfficialChannel;
  }

  /**
   * Extract video ID from YouTube URL
   * @param {string} url - YouTube URL
   * @returns {string|null} Video ID or null if invalid
   */
  extractVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Generate embed URL with custom parameters
   * @param {string} videoId - YouTube video ID
   * @param {Object} options - Embed options
   * @returns {string} Embed URL
   */
  generateEmbedUrl(videoId, options = {}) {
    const {
      autoplay = 0,
      controls = 1,
      showinfo = 0,
      rel = 0,
      modestbranding = 1,
      start = null
    } = options;

    let embedUrl = `https://www.youtube.com/embed/${videoId}?`;
    const params = new URLSearchParams({
      autoplay: autoplay.toString(),
      controls: controls.toString(),
      showinfo: showinfo.toString(),
      rel: rel.toString(),
      modestbranding: modestbranding.toString()
    });

    if (start) {
      params.append('start', start.toString());
    }

    return embedUrl + params.toString();
  }

  /**
   * Check if YouTube service is enabled and configured
   * @returns {boolean} True if service is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

module.exports = new YouTubeService();
