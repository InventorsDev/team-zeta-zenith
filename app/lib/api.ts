const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface ApiError {
  message: string;
  status: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name?: string;
}

export enum IntegrationType {
  SLACK = 'slack',
  ZENDESK = 'zendesk',
  EMAIL = 'email',
  DISCORD = 'discord',
  TEAMS = 'teams',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
}

export interface Integration {
  id: number;
  name: string;
  type: IntegrationType;
  status: IntegrationStatus;
  organization_id: number;
  webhook_url?: string;
  webhook_token?: string;
  api_endpoint?: string;
  created_at: string;
  updated_at: string;
  last_sync_at?: string;
  rate_limit_reset_at?: string;
  last_error?: string;
  current_hour_requests: number;
  total_tickets_synced: number;
  total_webhooks_received: number;
  has_config: boolean;
  config_fields: string[];
  sync_frequency: number;
  sync_tickets: boolean;
  receive_webhooks: boolean;
  send_notifications: boolean;
  rate_limit_per_hour: number;
  settings?: Record<string, any>;
}

export interface IntegrationCreate {
  name: string;
  type: IntegrationType;
  config: Record<string, any>;
  settings?: Record<string, any>;
  webhook_url?: string;
  webhook_secret?: string;
  api_endpoint?: string;
  sync_frequency?: number;
  sync_tickets?: boolean;
  receive_webhooks?: boolean;
  send_notifications?: boolean;
  rate_limit_per_hour?: number;
}

export interface IntegrationUpdate {
  name?: string;
  config?: Record<string, any>;
  settings?: Record<string, any>;
  webhook_url?: string;
  webhook_secret?: string;
  api_endpoint?: string;
  sync_frequency?: number;
  sync_tickets?: boolean;
  receive_webhooks?: boolean;
  send_notifications?: boolean;
  rate_limit_per_hour?: number;
}

export interface PaginatedIntegrations {
  items: Integration[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface IntegrationStats {
  total_integrations: number;
  active_integrations: number;
  error_integrations: number;
  pending_integrations: number;
  total_tickets_synced: number;
  total_webhooks_received: number;
  integrations_by_type: Record<string, number>;
  avg_sync_frequency_minutes?: number;
  last_sync_times: Record<string, string | null>;
}

export interface IntegrationTestResult {
  connected: boolean;
  configured: boolean;
  message: string;
  bot_info?: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const token = this.getAccessToken();

    const  headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error: ApiError = {
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
        };

        try {
          const errorData = await response.json();
          error.message = errorData.message || errorData.detail || error.message ;
        } catch {
          // If error response is not JSON, use default message
        }

        throw error;
      }

      return await response.json();
    } catch (error) {
      if ((error as ApiError).status) {
        throw error;
      }
      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      } as ApiError;
    }
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  async getCurrentUser(): Promise<UserResponse> {
    return this.request<UserResponse>('/auth/me', {
      method: 'GET',
    });
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = typeof window !== 'undefined'
      ? localStorage.getItem('refreshToken')
      : null;

    if (!refreshToken) {
      throw {
        message: 'No refresh token available',
        status: 401,
      } as ApiError;
    }

    const response = await this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    this.setTokens(response.access_token, response.refresh_token);
    return response;
  }

  logout(): void {
    this.clearTokens();
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Integration methods
  async getIntegrations(params?: {
    page?: number;
    size?: number;
    type?: IntegrationType;
    status?: IntegrationStatus;
    active_only?: boolean;
    search?: string;
  }): Promise<PaginatedIntegrations> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.active_only !== undefined) queryParams.append('active_only', params.active_only.toString());
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return this.request<PaginatedIntegrations>(
      `/integrations${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async getIntegrationStats(): Promise<IntegrationStats> {
    return this.request<IntegrationStats>('/integrations/stats', {
      method: 'GET',
    });
  }

  async getIntegration(id: number): Promise<Integration> {
    return this.request<Integration>(`/integrations/${id}`, {
      method: 'GET',
    });
  }

  async createIntegration(data: IntegrationCreate): Promise<Integration> {
    return this.request<Integration>('/integrations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateIntegration(id: number, data: IntegrationUpdate): Promise<Integration> {
    return this.request<Integration>(`/integrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteIntegration(id: number): Promise<void> {
    return this.request<void>(`/integrations/${id}`, {
      method: 'DELETE',
    });
  }

  async testIntegration(id: number): Promise<IntegrationTestResult> {
    return this.request<IntegrationTestResult>(`/integrations/${id}/test`, {
      method: 'POST',
      body: JSON.stringify({ test_connection: true }),
    });
  }

  async toggleIntegrationSync(id: number, enabled: boolean): Promise<Integration> {
    const endpoint = enabled ? `/integrations/${id}/enable-sync` : `/integrations/${id}/disable-sync`;
    return this.request<Integration>(endpoint, {
      method: 'PATCH',
    });
  }

  async toggleIntegrationWebhooks(id: number, enabled: boolean): Promise<Integration> {
    const endpoint = enabled ? `/integrations/${id}/enable-webhooks` : `/integrations/${id}/disable-webhooks`;
    return this.request<Integration>(endpoint, {
      method: 'PATCH',
    });
  }

  // Zendesk-specific methods
  async testZendeskConnection(): Promise<IntegrationTestResult> {
    return this.request<IntegrationTestResult>('/integrations/zendesk/test-connection', {
      method: 'POST',
    });
  }

  async syncZendeskTickets(fullSync: boolean = false): Promise<any> {
    return this.request<any>(`/integrations/zendesk/sync?full_sync=${fullSync}`, {
      method: 'POST',
    });
  }

  // Slack-specific methods
  async testSlackConnection(): Promise<IntegrationTestResult> {
    return this.request<IntegrationTestResult>('/integrations/slack/test-connection', {
      method: 'POST',
    });
  }

  async getSlackChannels(): Promise<any> {
    return this.request<any>('/integrations/slack/channels', {
      method: 'GET',
    });
  }

  async syncSlackMessages(fullSync: boolean = false): Promise<any> {
    return this.request<any>(`/integrations/slack/sync?full_sync=${fullSync}`, {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
