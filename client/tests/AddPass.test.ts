import { Config, MessageText } from '../ts/config'
import { afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { msgTextStore, rootEntryStore } from '../ts/store'
import AddPass from '../components/AddPass.svelte'
import { get } from 'svelte/store'
import { rootDummy } from './data'
import { tick } from 'svelte'

Config.useMockApi = true
Config.debugLogs = true

let pathInput: HTMLInputElement
let generateInput: HTMLInputElement
let passwordInput: HTMLInputElement
let verifyInput: HTMLInputElement
let submitBtn: HTMLButtonElement
let component: HTMLElement 

/**
 * Toggle the auto-generate checkbox and fetch the 
 * password and verify input elements.
 */
const setGenerate = async (shouldBeActive: boolean) => {
  if (shouldBeActive == generateInput.checked) {
    return
  }
  await fireEvent.input(generateInput, { target: { checked: shouldBeActive } })
  await tick()
  assert(shouldBeActive == generateInput.checked)

  if (!shouldBeActive) {
    passwordInput = component.querySelector("input[name='pass']")!
    verifyInput = component.querySelector("input[name='verify']")!
    expect(passwordInput).toBeTruthy()
    expect(verifyInput).toBeTruthy()
  }
}

const addPath = async (value: string, msg: MessageText, shouldExist: boolean,
  password = "") => {
  await fireEvent.input(pathInput, { target: { value: value } })

  if (password != "") {
    await fireEvent.input(passwordInput, { target: { value: password } })
    await fireEvent.input(verifyInput,   { target: { value: password } })
  }

  await fireEvent.click(submitBtn)
  await tick()

  const trimmedValue = value.replace(/^\//, "").replace(/\/$/, "")
  
  if (shouldExist) {
    expect(get(rootEntryStore).subpaths, `tree is missing '${trimmedValue}'`)
      .toContain(trimmedValue)
  } else {
    expect(get(rootEntryStore).subpaths, 
      `tree should not contain '${trimmedValue}'`)
      .not.toContain(trimmedValue)
  }

  expect(get(msgTextStore)[0], `Incorrect message for '${value}'`).toBe(msg)
}

describe('AddPass.svelte', () => {
  beforeAll( async () => {
    assert(rootDummy.subitems.length > 0, "Failed to load dummy data")

    rootEntryStore.set(rootDummy)
    expect(get(rootEntryStore).subitems.length,
      "Failed to update store with dummy data").toBe(rootDummy.subitems.length)
  })

  beforeEach(() => {
    const { container } = render(AddPass, { visible: true })
    component = container

    expect(component).toBeTruthy()

    pathInput = component.querySelector("input[name='path']")!
    generateInput = component.querySelector("input[name='generate']")!
    submitBtn = component.querySelector("button")!

    expect(pathInput).toBeTruthy()
    expect(generateInput).toBeTruthy()
    expect(submitBtn).toBeTruthy()
  })

  afterEach(() => cleanup())

  it('adds valid paths to the password tree', async () => {
    await setGenerate(true)
    await addPath("a/b/c",                        MessageText.added, true)
    await addPath("-_.@",                         MessageText.added, true)
    await addPath("@.@/-_-",                      MessageText.added, true)
    await addPath("A".repeat(Config.textMaxLen),  MessageText.added, true)

    // Leading and trailing slashes are trimmed away
    await addPath("/leading", MessageText.added, true)
    await addPath("trailing/", MessageText.added, true)
    await addPath("/both/", MessageText.added, true)
  })

  it('sets error messages for invalid paths', async () => {
    await setGenerate(true)
    await addPath(" ", MessageText.invalidPath, false)
    await addPath("/", MessageText.invalidPath, false)
    await addPath("Email/me.gpg", MessageText.invalidPath, false)
    await addPath("Email/.", MessageText.invalidPath, false)
    await addPath("Email/..", MessageText.invalidPath, false)
    await addPath("Email/../a", MessageText.invalidPath, false)
    await addPath("Email/./a", MessageText.invalidPath, false)
    await addPath("Email/a./a", MessageText.invalidPath, false)
    await addPath("Email/.b/a", MessageText.invalidPath, false)
    await addPath("Email/.....b/a", MessageText.invalidPath, false)
    await addPath("Email/$HOME", MessageText.invalidPath, false)
    await addPath("Email/\"$HOME\"", MessageText.invalidPath, false)
    await addPath("Email/\\", MessageText.invalidPath, false)
    await addPath("Email/😉", MessageText.invalidPath, false)

    await addPath("A".repeat(Config.textMaxLen + 1),  MessageText.invalidPath, false)

    await addPath("Github/Jane0x1", MessageText.pathOverlap, true) // Already exists
    await addPath("Github/Jane0x1/beneath_leaf", MessageText.pathOverlap, false)
    await addPath("Github/Jane0x1/a/b", MessageText.pathOverlap, false)
    await addPath("visa/beneath_leaf", MessageText.pathOverlap, false)

    await addPath("axa/".repeat(Config.maxPassDepth + 2), MessageText.invalidNesting, false)

  })

  //it('accepts valid passwords', async () => {
  //  await setGenerate(false)
  //  await addPath("001", MessageText.added, true, "hjkl")
  //  await addPath("002", MessageText.added, true, "_dir603Pw3Dd-uuJUVKL")
  //  await addPath("003", MessageText.added, true, "A".repeat(Config.textMaxLen))
  //  await addPath("004", MessageText.added, true, "-§$!\"'#€%&()=?*<>_.@/")
  //  await addPath("005", MessageText.added, true, "åäö")
  //  await addPath("006", MessageText.added, true, "ÅÄÖ")
  //})

  //it('rejects passwords with invalid characters', async () => {
  //  await setGenerate(false)
  //})

  //it('rejects passwords that do not match', async () => {
  //  await setGenerate(false)

  //})
})


