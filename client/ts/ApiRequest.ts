import { Config, MessageText } from "./config";
import type { ApiResponse } from '../ts/types';
import { ApiStatusResponse } from '../ts/types';
import { Err } from "./util";
import { msgTextStore } from "../ts/store";

export default class ApiRequest {
  private async baseRequest(url: string, reqInfo: RequestInit):
    Promise<ApiResponse> {
    if (Config.useMockApi) {
      return this.mockResponse(reqInfo.method!)
    }

    let apiRes = {
      status: ApiStatusResponse.error,
      desc: "Unknown error",
      value: ""
    } as ApiResponse
    try {
      const res = await fetch(url, reqInfo)
      try {
        apiRes = (await res.json()) as ApiResponse
      } catch (err) {
        apiRes.desc = "parsing response"
        Err(err)
      }
    } catch (err) {
      apiRes.desc = `accessing '${url}'`
      Err(err)
    }

    if (apiRes.status == ApiStatusResponse.error) {
      msgTextStore.set([MessageText.err, apiRes.desc])

    } else if (apiRes.status == ApiStatusResponse.failed) {
      msgTextStore.set([MessageText.failed, apiRes.desc])
    }
    return apiRes
  }

  /**
   * Fetch the value for a given path from the `/get` endpoint.
   * If no cached credentials are available, the `ApiResponse`
   * will be set to `ApiStatusResponse.retry`.
   * The method uses msgText.set() on its own if an error occurs.
   */
  async getPass(path: string, password: string): Promise<ApiResponse> {
    const reqInfo = password == "" ?
                    { method: 'GET' } as RequestInit :
                    { method: 'POST',
                      body: `pass=${password}`,
                      headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                      }
                    } as RequestInit

    return this.baseRequest(`/get?path=${path}`, reqInfo)
  }

  async delPass(path: string): Promise<ApiResponse> {
    return this.baseRequest(`/del?path=${path}`, {method: 'DELETE'})
  }

  async addPass(path: string, pass: string, generate: boolean): Promise<ApiResponse> {
    return this.baseRequest(`/add?path=${path}`, {
      method: 'POST',
      body: generate ? "generate=true" : `pass=${pass}`,
      headers: {
        'content-type': 'application/x-www-form-urlencoded'
      }
    } as RequestInit)
  }

  private mockResponse(method: string): ApiResponse {
    const mockDesc = "Mock response"
    switch (method) {
    case 'GET':
      return {
        status: ApiStatusResponse.success,
        desc: mockDesc,
        value: "password"
      }
    case 'POST':
      return {
        status: ApiStatusResponse.success,
        desc: mockDesc,
        value: ""
      }
    case 'DELETE':
      return {
        status: ApiStatusResponse.success,
        desc: mockDesc,
        value: ""
      }
    default:
      return {
        status: ApiStatusResponse.error,
        desc: "Unsupported method",
        value: ""
      }
    }
  }

}
