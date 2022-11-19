enum ApiStatusResponse {
  retry = "retry",
  success = "success",
  failed = "failed",
  error = "error"
}

/** The possible states for the folding logic in the password tree. */
enum FoldPolicy {
  allClosed,
  allOpen,
  localControl
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

/** An item to show using the <ShowPass/> component. */
interface PassItem {
  path: string
  password: string
}


export type { ApiResponse, AuthInfo, PassItem }
export { ApiStatusResponse, FoldPolicy }
