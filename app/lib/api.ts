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
  last_sync_time?: string;
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

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  PENDING = 'pending',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  ZENDESK = 'zendesk',
  API = 'api',
  WEB = 'web',
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: TicketChannel;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  external_id?: string;
  assigned_to?: number;
  organization_id: number;
  integration_id?: number;
  created_at: string;
  updated_at: string;
  first_response_at?: string;
  resolved_at?: string;
  closed_at?: string;
  last_activity_at?: string;
  sentiment_score?: number;
  category?: string;
  urgency_score?: number;
  confidence_score?: number;
  is_processed: boolean;
  needs_human_review: boolean;
  tags?: string[];
  ticket_metadata?: Record<string, any>;
  assignee_name?: string;
  integration_name?: string;
  organization_name?: string;
}

export interface TicketCreate {
  title: string;
  description: string;
  customer_email: string;
  customer_name?: string;
  customer_phone?: string;
  priority?: TicketPriority;
  channel: TicketChannel;
  tags?: string[];
  ticket_metadata?: Record<string, any>;
  integration_id?: number;
  external_id?: string;
}

export interface TicketUpdate {
  title?: string;
  description?: string;
  customer_name?: string;
  customer_phone?: string;
  priority?: TicketPriority;
  status?: TicketStatus;
  assigned_to?: number;
  tags?: string[];
  ticket_metadata?: Record<string, any>;
}

export interface PaginatedTickets {
  items: Ticket[];
  total: number;
  page: number;
  size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  pending_tickets: number;
  avg_response_time_hours?: number;
  avg_resolution_time_hours?: number;
  tickets_by_priority: Record<string, number>;
  tickets_by_channel: Record<string, number>;
  tickets_by_category: Record<string, number>;
  sentiment_distribution: Record<string, number>;
}

export interface SyncStatus {
  integration_id: number;
  integration_name: string;
  integration_type: IntegrationType;
  last_sync_time?: string;
  next_sync_at?: string;
  sync_in_progress: boolean;
  last_sync_status: 'success' | 'failed' | 'partial' | null;
  last_sync_records: number;
  last_sync_error?: string;
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
}

export interface SyncHistory {
  id: number;
  integration_id: number;
  started_at: string;
  completed_at?: string;
  status: 'success' | 'failed' | 'partial' | 'in_progress';
  records_synced: number;
  error_message?: string;
  error_details?: Record<string, any>;
}

export interface SyncResponse {
  message: string;
  sync_id: number;
  status: string;
  records_synced?: number;
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

  // Sync status methods - use integration-specific endpoints
  async getZendeskStatus(): Promise<any> {
    return this.request<any>('/integrations/zendesk/status', {
      method: 'GET',
    });
  }

  async getSlackStatus(): Promise<any> {
    return this.request<any>('/integrations/slack/status', {
      method: 'GET',
    });
  }

  async syncEmailIntegration(): Promise<any> {
    return this.request<any>('/email-integration/sync', {
      method: 'POST',
    });
  }

  // Analytics methods
  async getAnalyticsDashboard(params?: {
    start_date?: string;
    end_date?: string;
    use_cache?: boolean;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

    const query = queryParams.toString();
    return this.request<any>(
      `/analytics/dashboard${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async getAnalyticsTimeSeries(params: {
    metric_type: string;
    start_date: string;
    end_date: string;
    granularity?: string;
    status?: string[];
    priority?: string[];
    channel?: string[];
    category?: string[];
    use_cache?: boolean;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('start_date', params.start_date);
    queryParams.append('end_date', params.end_date);
    if (params.granularity) queryParams.append('granularity', params.granularity);
    if (params.status) params.status.forEach(s => queryParams.append('status', s));
    if (params.priority) params.priority.forEach(p => queryParams.append('priority', p));
    if (params.channel) params.channel.forEach(c => queryParams.append('channel', c));
    if (params.category) params.category.forEach(c => queryParams.append('category', c));
    if (params.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

    return this.request<any>(
      `/analytics/time-series/${params.metric_type}?${queryParams.toString()}`,
      { method: 'GET' }
    );
  }

  async getAnalyticsDistribution(params: {
    field: string;
    start_date: string;
    end_date: string;
    status?: string[];
    priority?: string[];
    use_cache?: boolean;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    queryParams.append('start_date', params.start_date);
    queryParams.append('end_date', params.end_date);
    if (params.status) params.status.forEach(s => queryParams.append('status', s));
    if (params.priority) params.priority.forEach(p => queryParams.append('priority', p));
    if (params.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

    return this.request<any>(
      `/analytics/distribution/${params.field}?${queryParams.toString()}`,
      { method: 'GET' }
    );
  }

  async getPerformanceMetrics(params?: {
    start_date?: string;
    end_date?: string;
    use_cache?: boolean;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.use_cache !== undefined) queryParams.append('use_cache', params.use_cache.toString());

    const query = queryParams.toString();
    return this.request<any>(
      `/analytics/performance${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  // Ticket methods
  async getTickets(params?: {
    page?: number;
    size?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    status?: TicketStatus;
    priority?: TicketPriority;
    channel?: TicketChannel;
    assigned_to?: number;
    unassigned?: boolean;
    customer_email?: string;
    search?: string;
    needs_review?: boolean;
    is_processed?: boolean;
  }): Promise<PaginatedTickets> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.channel) queryParams.append('channel', params.channel);
    if (params?.assigned_to !== undefined) queryParams.append('assigned_to', params.assigned_to.toString());
    if (params?.unassigned !== undefined) queryParams.append('unassigned', params.unassigned.toString());
    if (params?.customer_email) queryParams.append('customer_email', params.customer_email);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.needs_review !== undefined) queryParams.append('needs_review', params.needs_review.toString());
    if (params?.is_processed !== undefined) queryParams.append('is_processed', params.is_processed.toString());

    const query = queryParams.toString();
    return this.request<PaginatedTickets>(
      `/tickets${query ? `?${query}` : ''}`,
      { method: 'GET' }
    );
  }

  async getTicketStats(): Promise<TicketStats> {
    return this.request<TicketStats>('/tickets/stats', {
      method: 'GET',
    });
  }

  async getTicket(id: number): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`, {
      method: 'GET',
    });
  }

  async createTicket(data: TicketCreate): Promise<Ticket> {
    return this.request<Ticket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTicket(id: number, data: TicketUpdate): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTicket(id: number): Promise<void> {
    return this.request<void>(`/tickets/${id}`, {
      method: 'DELETE',
    });
  }

  async updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async assignTicket(id: number, userId: number | null): Promise<Ticket> {
    return this.request<Ticket>(`/tickets/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to: userId }),
    });
  }

  async exportTickets(format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/tickets/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAccessToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export tickets');
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
