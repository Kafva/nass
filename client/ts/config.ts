class Config {
  static debug = true
  /** Toggled in tests to skip actual API requests */
  static useMockApi = false

  /** !! Mirrored options from config.go !! */
  static readonly textMaxLen = 255

  /**
   * No folders are allowed with this set to 0
   * One '/' is allowed if it is set to 1, etc.
   */
  static readonly maxPassDepth = 6

  // Icon classes
  static readonly dropdownClosed = 'nf-fa-angle_right'
  static readonly dropdownOpen = 'nf-fa-angle_down'
  static readonly passwordIcon = 'nf-mdi-key'
  static readonly passwordPrompt = 'nf-fa-angle_double_right'
  static readonly clipboardIcon = 'nf-mdi-clipboard_outline'
  static readonly suggestIcon = 'nf-custom-folder_open'

  static readonly showPassword = 'nf-oct-eye'
  static readonly deleteIcon = 'nf-fa-minus'

  static dump() {
    const dictArr =
      Object.entries(this).map((tpl) => { return { [tpl[0]]: tpl[1] }; })
    // Join the [{key: value}, ...] array into one object
    const flatDict = dictArr.reduce( (prev, next) => {
      return Object.assign(prev, next);  },
    {})
    console.table(flatDict)
  }
}

/** Predefined text for <Msg/> messages */
enum MessageText {
  clipboard = "Copied to clipboard",
  added = "Added",
  deleted = "Deleted",
  pathOverlap = "One or more entries in the path already exist.",
  invalidNesting = "Path contains to many '/' separators.",
  invalidPath = "Invalid format for path",
  invalidPass = "Invalid format for password",
  invalidVerify = "Passwords do not match",
  failed = "Failed: ", // Only used for incorrect password entry
  err = "Error: ",
  valid = "Valid" // Only used internally
}

/** Predefined icon mappings for messages: */
const MessageIcons: { [id: string]: string } = {
  [MessageText.clipboard]: "nf-mdi-clipboard_check",
  [MessageText.added]: "nf-mdi-key_plus",
  [MessageText.deleted]: "nf-mdi-key_minus",
  [MessageText.failed]: "nf-oct-issue_opened",
  [MessageText.err]: "nf-oct-issue_opened",
  [MessageText.pathOverlap]: "nf-mdi-textbox",
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
  [MessageText.failed]: 8_000,
  [MessageText.err]: -1,
  [MessageText.pathOverlap]: 4000,
  [MessageText.invalidNesting]: 4000,
  [MessageText.invalidPath]: 4000,
  [MessageText.invalidPass]: 4000,
  [MessageText.invalidVerify]: 4000,
}

// !! Mirrored in config.go !!
const passentryRegex = "^[-_.@/a-zA-Z0-9]{1," + Config.textMaxLen + "}$"
const passwordRegex = "^[-§$!\"'#€%&()=?*<>_.@/a-zA-Z0-9åäöÅÄÖ]{1," + Config.textMaxLen + "}$"


export { Config, MessageText, MessageIcons, MessageTimeouts, passentryRegex, passwordRegex }
