import { readJsonFile } from "./util.service.js";

const bugs = readJsonFile('./data/bugs.json')

export const bugService = {
    query,
}

function query() {
    return Promise.resolve(bugs)
}