enum ApiStatusResponse {
  retry = "retry",
  success = "success",
  error = "error"
}

interface ApiResponse {
  status: ApiStatusResponse
  desc: string
  value: string
}

/**
 * Attributes related to the activation of an entry
 * in the password tree.
 */
interface AuthInfo {
  path: string
  useClipboard: boolean
}

/** An item to show using the <ShowPass/> component */
interface PassItem {
  path: string
  password: string
}

/** A deletion or creation event in the password tree */
interface TreeUpdate {
  path: string
  // A false value indicates 'create'
  delete: boolean
}

export type { ApiResponse, AuthInfo, PassItem, TreeUpdate }
export { ApiStatusResponse }
