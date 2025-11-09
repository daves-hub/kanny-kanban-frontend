const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

class ApiClient {
  private baseURL: string;
  private onUnauthorized?: () => void;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Set callback for when token is invalid/expired
  setUnauthorizedCallback(callback: () => void): void {
    this.onUnauthorized = callback;
  }

  private getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
      localStorage.setItem("token_timestamp", Date.now().toString());
    }
  }

  clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("token_timestamp");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle non-JSON responses (e.g., 204 No Content)
      const contentType = response.headers.get("content-type");
      const hasJson = contentType?.includes("application/json");

      let data: unknown = null;
      if (hasJson && response.status !== 204) {
        data = await response.json();
      }

      const isNotModified = response.status === 304;

      if (!response.ok && !isNotModified) {
        const errorMessage =
          (data as { message?: string })?.message ||
          `HTTP ${response.status}: ${response.statusText}`;
        
        // Handle 401 Unauthorized - token expired or invalid
        if (response.status === 401) {
          this.clearToken();
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
        }
        
        throw new ApiError(response.status, errorMessage, data);
      }

      if (isNotModified) {
        return (data ?? null) as T;
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network errors or other fetch failures
      throw new ApiError(
        0,
        error instanceof Error ? error.message : "Network error occurred"
      );
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient(API_URL);
