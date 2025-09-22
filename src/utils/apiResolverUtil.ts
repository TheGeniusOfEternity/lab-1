import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

interface RequestConfig<T> extends AxiosRequestConfig {
  data?: T;
}

interface ErrorResponse {
  status: string;
  message: string;
}

export class ApiResolverUtil {
  private readonly endpoint;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  public async request<U, R>(url: string, method: string, data: U): Promise<R> {
    const fullUrl = `${this.endpoint}/${url}/`;
    const config: RequestConfig<U> = {
      url: fullUrl,
      method,
      data,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response: AxiosResponse<R> = await axios(config);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError<ErrorResponse>(error)) {
        return {
          status: error.response?.data.status
            ? error.response.data.status
            : undefined,
          message: error.response?.data.message
            ? error.response.data.message
            : undefined,
        } as R;
      } else {
        return {
          status: '???',
          message: 'Unknown error occurred',
        } as R;
      }
    }
  }
}
