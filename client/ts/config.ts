class Config {
  static readonly debugLogs = true

  // !! Mirrored options from config.go !!
  static readonly textMaxLen = 255
  static readonly maxPassDepth = 6

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
  pathExists = "Path already exists",
  invalidNesting = "Path contains  to many '/' separators",
  invalidPath = "Invalid format for path",
  invalidPass = "Invalid format for password",
  invalidVerify = "Passwords do not match",
  err = "Error:",
  valid = "Valid" // Only used internally
}

/** Predefined icon mappings for messages: */
const MessageIcons: { [id: string]: string } = {
  [MessageText.clipboard]: "nf-mdi-clipboard_check",
  [MessageText.added]: "nf-mdi-key_plus",
  [MessageText.deleted]: "nf-mdi-key_minus",
  [MessageText.err]: "nf-oct-issue_opened",
  [MessageText.pathExists]: "nf-mdi-textbox",
  [MessageText.invalidNesting]: "nf-mdi-textbox",
  [MessageText.invalidPath]: "nf-mdi-textbox",
  [MessageText.invalidPass]: "nf-mdi-textbox_password",
  [MessageText.invalidVerify]: "nf-mdi-textbox_password",
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
  [MessageText.pathExists]: 4000,
  [MessageText.invalidNesting]: 4000,
  [MessageText.invalidPath]: 4000,
  [MessageText.invalidPass]: 4000,
  [MessageText.invalidVerify]: 4000,
}

// !! Mirrored in config.go !!
const passentryRegex = "^[-_.@/a-zA-Z0-9]{1," + Config.textMaxLen + "}$"
const passwordRegex = "^[-§$!\"'#€%&()=?*<>_.@/a-zA-Z0-9åäöÅÄÖ]{1," + Config.textMaxLen + "}$"

export { Config, MessageText, MessageIcons, MessageTimeouts, passentryRegex, passwordRegex }
