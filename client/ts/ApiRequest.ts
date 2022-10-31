import { msgText } from "../ts/store";
import { MessageText, ApiStatusResponse } from '../ts/types';
import type { ApiResponse } from '../ts/types';

export default class ApiRequest {
  constructor(){}

  /**
   * Fetch the value for a given path from the `/get` endpoint.
   * If no cached credentials are available, the `ApiResponse`
   * will be set to `ApiStatusResponse.retry`.
   * The method uses msgText.set() on its own if an error occurs.
   */
  async getPass(path: string, password: string): Promise<ApiResponse> {
    let apiRes = {
      status: ApiStatusResponse.error,
      desc: "Unknown error",
      value: ""
    } as ApiResponse
    const reqInfo = password == "" ?
                    { method: 'GET' } as RequestInit :
                    { method: 'POST',
                        body: `pass=${password}`,
                        headers: {
                          'content-type': 'application/x-www-form-urlencoded'
                        }
                    } as RequestInit
    try {
      const res = await fetch(`/get?path=${path.slice(1)}`, reqInfo)
      try {
        apiRes = (await res.json()) as ApiResponse
      } catch (err) {
        apiRes.desc = "parsing response"
        console.error(err)
      }
    } catch (err) {
      apiRes.desc = `fetching '${path}'`
      console.error(err)
    }

    if (apiRes.status == ApiStatusResponse.error) {
      msgText.set([MessageText.err, apiRes.desc])
    }
    return apiRes
  }
}
