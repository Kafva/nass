// Predefined <Msg/> messages
enum MessageText {
  clipboard = "Copied to clipboard",
  added = "Added ",
  deleted = "Deleted ",
}

// Predefined icon mappings for messages:
//    Copied to clipboard!
//    Entry added
//    Entry deleted
const MessageIcons: { [id: string]: string } = {
  [MessageText.clipboard]: "nf-mdi-clipboard_check",
  [MessageText.added]: "nf-mdi-key_plus",
  [MessageText.deleted]: "nf-mdi-key_minus",
}

export { MessageText, MessageIcons }
