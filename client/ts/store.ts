import { writable } from 'svelte/store'

// 'Stores' can be used in Svelte to share values between components that are
// far apart in the component hierachy.
export const queryString = writable("")
