import { readJsonFile } from "./util.service.js";

const bugs = readJsonFile('./data/bugs.json')

export const bugService = {
    query,
    getById
}

function query() {
    return Promise.resolve(bugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    return Promise.resolve(bug)
}