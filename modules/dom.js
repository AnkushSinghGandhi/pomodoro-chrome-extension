//querySelector function
export const $ = (selector, context = document) => context.querySelector(selector)

//querySelectorAll function
export const $$ = (selector, context = document) => context.querySelectorAll(selector)