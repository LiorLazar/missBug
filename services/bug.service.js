import { loggerService } from "./logger.service.js";
import { makeId, readJsonFile, writeJsonFile } from "./util.service.js";

const bugs = readJsonFile('./data/bug.json')
const PAGE_SIZE = 3

export const bugService = {
    query,
    getById,
    remove,
    save
}

function query(filterBy = {}) {
    let bugsToDisplay = bugs

    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugsToDisplay = bugsToDisplay.filter(bug => regExp.test(bug.title))
    }

    if (filterBy.minSeverity) {
        bugsToDisplay = bugsToDisplay.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.sortBy) {
        const dir = filterBy.sortDir
        if (filterBy.sortBy === 'title') bugsToDisplay.sort((b1, b2) => b1.title.localeCompare(b2.title) * dir)
        if (filterBy.sortBy === 'description') bugsToDisplay.sort((b1, b2) => b1.description.localeCompare(b2.description) * dir)
        if (filterBy.sortBy === 'severity') bugsToDisplay.sort((b1, b2) => b1.severity - b2.severity * dir)
        if (filterBy.sortBy === 'createdAt') bugsToDisplay.sort((b1, b2) => b1.createdAt - b2.createdAt * dir)
    }

    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        bugsToDisplay = bugsToDisplay.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return Promise.resolve(bugsToDisplay)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)

    if (!bug) {
        loggerService.error(`Couldnt find bug ${bugId} in bugService`)
        return Promise.reject(`Couldnt find bug`)
    }
    return Promise.resolve(bug)
}

function remove(bugId) {
    const idx = bugs.findIndex(bug => bug._id === bugId)
    if (idx === -1) {
        loggerService.error(`couldnt find bug ${bugId} in bugService`)
        return Promise.reject('Couldnt remove bug')
    }

    bugs.splice(idx, 1)
    return _saveBugs()
}

function _saveBugs() {
    return writeJsonFile('./data/bug.json', bugs)
}

function save(bugToSave) {
    if (bugToSave._id) {
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)

        if (idx === -1) {
            loggerService.error(`Couldnt find bug ${bugToSave._id} in bugService`)
            return Promise.reject('Couldt save bug')
        }
        bugs.splice(idx, 1, bugToSave)
    } else {
        bugToSave._id = makeId()
        bugs.push(bugToSave)
    }
    return _saveBugs()
        .then(() => bugToSave)
}