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
