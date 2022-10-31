import { authDialogForPath, msgText } from "../ts/store";
import { MessageText, ApiStatusResponse } from '../ts/types';
import type { ApiResponse } from '../ts/types';


export default class ApiRequest {
  constructor(){}

  /**
   * Attempts to fetch the value for `path` through a POST request
   * to the /get endpoint with the provided `password`.
   * Returns an empty string on failure.
   */
  async getPasswordWithAuth(path: string, password: string): Promise<string> {
    try {
      const res = await fetch(`/get?path=${path.slice(1)}`, {
        method: 'POST',
        body: `pass=${password}`,
        headers: {
          'content-type': 'application/x-www-form-urlencoded'
        }
      })
      try {
        const apiRes = (await res.json()) as ApiResponse

        switch (apiRes.status) {
        case ApiStatusResponse.success:
          return apiRes.value
        default:
          msgText.set([MessageText.err,`${res.status}: '${apiRes.desc}'`])
        }
      } catch (err) {
        msgText.set([MessageText.err, "parsing response"])
        console.error(err)
      }
    } catch (err) {
      msgText.set([MessageText.err,`fetching '${path}'`])
      console.error(err)
    }
    return ""
  }


  async getPassword(path: string): Promise<string> {
    try {
      const res = await fetch(`/get?path=${path.slice(1)}`)
      try {
        const apiRes = (await res.json()) as ApiResponse

        switch (apiRes.status) {
        case ApiStatusResponse.error:
          msgText.set([MessageText.err, `${res.status}: '${apiRes.desc}'`])
          break;
        case ApiStatusResponse.retry:
          authDialogForPath.set(path)
          break;
        case ApiStatusResponse.success:
          console.log("Already authenticated", apiRes)
          return apiRes.value
        }
      } catch (err) {
        msgText.set([MessageText.err, "parsing response"])
        console.error(err)
      }
    } catch (err) {
      msgText.set([MessageText.err,`fetching '${path}'`])
      console.error(err)
    }
    return ""
  }

}
