import type { TreeUpdate, AuthInfo, PassItem } from './types'
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

/** Tracks deletion and creation events for the password tree */
export const treeUpdateStore = writable<TreeUpdate>({path: "", delete: false})
