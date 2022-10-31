import { writable } from 'svelte/store'
/**
 * 'Stores' can be used in Svelte to share values between components that are
 * far apart in the component hierarchy.
 */
export const queryString = writable("")

/**
 * Used to create alerts from anywhere in the application
 * First item is used as a key in the `MessageIcons` dict and the
 * second is appended to form the complete message
 */
export const msgText = writable<[string,string]>(["",""])

/**
 * Used to control if the <Auth/> dialog needs to be displayed.
 * This store contains the path to the resource that should
 * be decrypted or an empty string if the dialog should be hidden.
 */
export const authDialogForPath = writable("")

/**
 * Determines if the modal with a [path,password] should be shown.
 * It might seem like a bad idea to have sensitive data in a store
 * but I do not think this makes the GC (notably) less likely to delete the
 * string from memory.
 */
export const showPassValues = writable<[string,string]>(["",""])
