import { Config, MessageText } from '../ts/config'
import { afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { msgTextStore, rootEntryStore } from '../ts/store'
import AddPass from '../components/AddPass.svelte'
import { get } from 'svelte/store'
import { rootDummy } from './data'
import { tick } from 'svelte'

Config.useMockApi = true
Config.debugLogs = false

let pathInput: HTMLInputElement;
let submitBtn: HTMLButtonElement;

const addPass = async (value: string) => {
  await fireEvent.input(pathInput, { target: { value: value } })
  await fireEvent.click(submitBtn)
  await tick() // Wait for DOM to update
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
    expect(container).toBeTruthy()

    pathInput = container.querySelector("input[name='path']")!
    submitBtn = container.querySelector("button")!
  })

  
  afterEach(() => cleanup())

  it('successfully adds valid paths to the PassEntry tree', async () => {
    await addPass("valid")
    expect(get(rootEntryStore).subitems.map(s=>s.name)).toContain("valid")
  })

  it('sets error messages for invalid paths', async () => {
    await addPass(" ")
    expect(get(rootEntryStore).subitems.map(s=>s.name)).not.toContain(" ")
    expect(get(msgTextStore)[0]).toBe(MessageText.invalidPath)
  })

  // Inline vi. for tests
})


