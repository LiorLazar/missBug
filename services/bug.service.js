import { loggerService } from "./logger.service.js";
import { makeId, readJsonFile, writeJsonFile } from "./util.service.js";

const bugs = readJsonFile('./data/bug.json')

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