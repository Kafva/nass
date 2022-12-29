import { Config, MessageText, passwordSymbols } from '../ts/config'
import { afterEach, assert, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render } from '@testing-library/svelte'
import { msgTextStore, rootEntryStore } from '../ts/store'
import AddPass from '../components/AddPass.svelte'
import { get } from 'svelte/store'
import { rootDummy } from './data'
import { tick } from 'svelte'

Config.useMockApi = true
Config.debug = false

let pathInput: HTMLInputElement
let passwordInput: HTMLInputElement
let verifyInput: HTMLInputElement
let submitBtn: HTMLButtonElement

const addPath = async (value: string, msg: MessageText, shouldExist: boolean,
    password = "") => {
    await fireEvent.input(pathInput, { target: { value: value } })

    if (password != "") {
        await fireEvent.input(passwordInput, { target: { value: password } })
        await fireEvent.input(verifyInput,   { target: { value: password } })
        assert(passwordInput.value == password && verifyInput.value == password,
            `Conflicting verification '${passwordInput.value}' == '${verifyInput.value}' == '${password}'`)
    }

    await fireEvent.click(submitBtn)
    await tick() // !!

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

    // NOTE: 'expect' needs to be explicitly listed as an argument for
    // the testname to be non-null.
    beforeEach( ({expect}) => {
        // !!                                                         !!
        // !! Hacky matching on test name to access password <input/> !!
        // !!                                                         !!
        const usePassword = expect.getState()
            .currentTestName?.includes("[PASSWORD]")
        const { container } = render(AddPass, {
            visible: true,
            generatePass: !usePassword
        })
        expect(container).toBeTruthy()

        pathInput = container.querySelector("input[name='path']")!
        submitBtn = container.querySelector("button")!

        expect(pathInput).toBeTruthy()
        expect(submitBtn).toBeTruthy()

        if (usePassword) {
            passwordInput = container.querySelector("input[name='pass']")!
            verifyInput = container.querySelector("input[name='verify']")!
            expect(passwordInput).toBeTruthy()
            expect(verifyInput).toBeTruthy()
        }
    })

    afterEach(() => cleanup())

    it('adds valid paths to the password tree', async () => {
        await addPath("a/b/c",                        MessageText.added, true)
        await addPath("-_.@",                         MessageText.added, true)
        await addPath("@.@/-_-",                      MessageText.added, true)
        await addPath("A".repeat(Config.textMaxLen),  MessageText.added, true)
        await addPath("gg+",                          MessageText.added, true)

        // Leading and trailing slashes are trimmed away
        await addPath("/leading", MessageText.added, true)
        await addPath("trailing/", MessageText.added, true)
        await addPath("/both/", MessageText.added, true)
    })

    it('rejects invalid paths', async () => {
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

    it('[PASSWORD] accepts valid passwords', async () => {
        await addPath("001", MessageText.added, true, "hjkl")
        await addPath("002", MessageText.added, true, "_dir603Pw3Dd-uuJUVKL")
        await addPath("003", MessageText.added, true, "A".repeat(Config.textMaxLen))
        await addPath("004", MessageText.added, true, passwordSymbols.replace("\\", ""))
        await addPath("005", MessageText.added, true, "åäö")
        await addPath("006", MessageText.added, true, "ÅÄÖ")
        await addPath("007", MessageText.added, true, "Sometimes the default accessible name of an element is missing, or does not accurately describe its contents, and there is no content visible in the DOM that can be associated with the object to give it meaning.")
    })

    it('[PASSWORD] rejects passwords with invalid characters', async () => {
        await addPath("010", MessageText.invalidPass, false, "A".repeat(Config.textMaxLen+1))
        await addPath("020", MessageText.invalidPass, false, "\\a")
        await addPath("030", MessageText.invalidPass, false, "\\")
        await addPath("040", MessageText.invalidPass, false, ">>> 🤣 <<<")
    })

    it('[PASSWORD] rejects passwords that do not match', async () => {
        const pathName = "verify_failure"
        await fireEvent.input(pathInput, { target: { value: pathName } })

        await fireEvent.input(passwordInput, { target: { value: "password" } })
        await fireEvent.input(verifyInput,   { target: { value: "Password" } })
        await fireEvent.click(submitBtn)
        await tick() // !!

        expect(get(rootEntryStore).subpaths, `tree should not contain '${pathName}'`)
            .not.toContain(pathName)

        expect(get(msgTextStore)[0], `Incorrect message for '${pathName}'`)
            .toBe(MessageText.invalidVerify)
    })
})


