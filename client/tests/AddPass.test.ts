import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import AddPass from '../components/AddPass.svelte'
import { Config } from '../ts/config'

Config.useMockApi = true

describe('AddPass.svelte', () => {
  afterEach(() => cleanup())

  it('mounts', () => {
    const { container } = render(AddPass, { visible: true })
    expect(container).toBeTruthy()
  })

  // This module is meant to test validation of paths and passwords,
  // 
  // To test that the rootEntry tree is updated in an expected manner
  // requires mocking the rootEntryStore...
  //
  // We could maybe do inline-tests instead...?
})


