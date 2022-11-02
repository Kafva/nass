class Config {
  static readonly debugLogs = true

  // Icon classes
  static readonly dropdownClosed = 'nf nf-fa-angle_right'
  static readonly dropdownOpen = 'nf nf-fa-angle_down'
  static readonly passwordIcon = 'nf nf-mdi-key'
  static readonly passwordPrompt = 'nf nf-fa-angle_double_right'

  static readonly showPassword = 'nf nf-oct-eye'
  static readonly deleteIcon = 'nf nf-fa-close'
}

/** Predefined text for <Msg/> messages */
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
 * Predefined timeout values (including transition time) for notifications.
 * Negative values can be used to avoid a timeout entirely.
 */
const MessageTimeouts: { [id: string]: number } = {
  [MessageText.clipboard]: 4000,
  [MessageText.added]: 4000,
  [MessageText.deleted]: 4000,
  [MessageText.err]: 10_000,
}

export { Config, MessageText, MessageIcons, MessageTimeouts }
