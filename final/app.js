import vue from 'vue';

export let ssrApp = new vue({
    data: () => ({ count: 1 }),
    template: `<button @click="count++">{{ count }}</button>`
})