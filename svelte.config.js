import sveltePreprocess from 'svelte-preprocess'

export default {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: sveltePreprocess(),

    // https://github.com/sveltejs/language-tools/issues/650
    onwarn: (warning, handler) => {
        if (warning.code.startsWith('a11y-')) return
        handler(warning)
    },
}
