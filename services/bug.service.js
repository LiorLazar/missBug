import { makeId, readJsonFile, writeJsonFile } from "./util.service.js";

const bugs = readJsonFile('./data/bug.json')

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query() {
    return Promise.resolve(bugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    console.log('bugs-before:', bugs)
    const idx = bugs.findIndex(bug => bug._id === bugId)
    bugs.splice(idx, 1)
    console.log('bugs-after:', bugs)

    return _saveBugs()
}

function _saveBugs() {
    return writeJsonFile('./data/bug.json', bugs)
}

function save(bugToSave) {
    if (bugToSave._id) {
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)
        bugs.splice(idx, 1, bugToSave)
    } else {
        bugToSave._id = makeId()
        bugs.push(bugToSave)
    }
    return _saveBugs()
        .then(() => bugToSave)
}