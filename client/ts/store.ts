import type { AuthInfo, PassItem } from './types'
import { FoldPolicy } from './types'
import PassEntry from './PassEntry'
import { writable } from 'svelte/store'


/**
 * 'Stores' can be used in Svelte to share values between components that are
 * far apart in the component hierarchy.
 */
export const queryStringStore = writable("")

/**
 * Used to create alerts from anywhere in the application
 * First item is used as a key in the `MessageIcons` dict and the
 * second is appended to form the complete message
 */
export const msgTextStore = writable<[string,string]>(["",""])

/** If none empty, show the <Loading/> overlay. */
export const loadingTextStore = writable<string>("")

/**
 * Used to control if the <Auth/> dialog needs to be displayed and
 * wheter or not to use the clipboard to save requestsed passwords.
 */
export const authInfoStore = writable<AuthInfo>({path: "", useClipboard: false})

/**
 * Determines if the modal with a [path,password] should be shown.
 * It might seem like a bad idea to have sensitive data in a store
 * but I do not think this makes the GC (notably) less likely to delete the
 * string from memory.
 */
export const showPassStore = writable<PassItem>({path: "", password: ""})

/**
 * Reference to the root node in the password tree. This is used e.g.
 * to determine if an entry already exists from <AddPass/>
 */
export const rootEntryStore = writable<PassEntry>(new PassEntry("", [], [], []))

/** Used to control if the password tree should be fully folded/unfolded */
export const foldPolicyStore = writable<FoldPolicy>(FoldPolicy.localControl)

/**
 * Path to the `PassEntry` (if any) that currently has the show/delete
 * buttons visible.
 *
 * This is explicirly unset when:
 *  A dialog button (like <Help/>) is clicked
 *  The <svelte:body/> is clicked
 *  The <Search/> gains focus
 *  A touchend() event that was considered a click is detected
 */
export const visibleButtonsStore = writable<string>("")
