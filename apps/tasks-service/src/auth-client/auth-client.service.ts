import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly httpClient: AxiosInstance;
  private readonly usernameCache = new Map<number, string>();

  constructor(private configService: ConfigService) {
    const authServiceUrl =
      this.configService.get<string>('AUTH_SERVICE_URL') ||
      'http://localhost:4000';

    this.httpClient = axios.create({
      baseURL: `${authServiceUrl}/auth`,
      timeout: 5000,
    });
  }

  async getUsernameById(userId: number): Promise<string | undefined> {
    // Check cache first
    if (this.usernameCache.has(userId)) {
      return this.usernameCache.get(userId);
    }

    try {
      const response = await this.httpClient.get(`/users/${userId}`);
      const username = response.data?.username;

      if (username) {
        // Cache for 5 minutes
        this.usernameCache.set(userId, username);
        setTimeout(() => this.usernameCache.delete(userId), 5 * 60 * 1000);
      }

      return username;
    } catch (error) {
      this.logger.warn(
        `Failed to fetch username for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return undefined;
    }
  }

  async enrichWithUsernames<
    T extends { authorId?: number; createdBy?: number },
  >(items: T[]): Promise<T[]> {
    const userIds = new Set<number>();

    items.forEach((item) => {
      if (item.authorId) userIds.add(item.authorId);
      if (item.createdBy) userIds.add(item.createdBy);
    });

    // Fetch all usernames in parallel
    const usernamePromises = Array.from(userIds).map((id) =>
      this.getUsernameById(id),
    );
    await Promise.all(usernamePromises);

    // Enrich items with usernames
    return items.map((item) => ({
      ...item,
      ...(item.authorId && {
        authorName: this.usernameCache.get(item.authorId),
      }),
      ...(item.createdBy && {
        createdByUsername: this.usernameCache.get(item.createdBy),
      }),
    }));
  }
}
