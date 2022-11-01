/** Predefined <Msg/> messages */
enum MessageText {
  clipboard = "Copied to clipboard",
  added = "Added",
  deleted = "Deleted",
  err = "Error:"
}

/** Predefined icon mappings for messages: */
const MessageIcons: { [id: string]: string } = {
  [MessageText.clipboard]: "nf-mdi-clipboard_check",
  [MessageText.added]: "nf-mdi-key_plus",
  [MessageText.deleted]: "nf-mdi-key_minus",
  [MessageText.err]: "nf-oct-issue_opened",
}

/**
 * Predefined timeout values (including transistion time) for noitications
 * negative values indicate no timeout.
 */
const MessageTimeouts: { [id: string]: number } = {
  [MessageText.clipboard]: 4000,
  [MessageText.added]: 4000,
  [MessageText.deleted]: 4000,
  [MessageText.err]: -1,
}

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

// An item to show using the <ShowPass/> component
interface PassItem {
  path: string
  password: string
}

export type { ApiResponse, AuthInfo, PassItem }
export { MessageText, MessageIcons, ApiStatusResponse, MessageTimeouts }
