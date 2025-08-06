import { loggerService } from "./logger.service.js";
import { makeId, readJsonFile, writeJsonFile } from "./util.service.js";

const bugs = readJsonFile('./data/bug.json')
const PAGE_SIZE = 3

export const bugService = {
    query,
    getById,
    remove,
    save,
    getLabels,
    getSortFields
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

    if (filterBy.labels) {
        bugsToDisplay = bugsToDisplay.filter(bug => bug.labels.some(label => filterBy.labels.includes(label)))
    }

    if (filterBy.sortBy) {
        const isDesc = filterBy.sortBy.startsWith('-')
        const sortField = isDesc ? filterBy.sortBy.slice(1) : filterBy.sortBy
        const dir = isDesc ? -1 : 1

        if (sortField === 'title') {
            bugsToDisplay.sort((b1, b2) => b1.title.localeCompare(b2.title) * dir)
        } else if (sortField === 'description') {
            bugsToDisplay.sort((b1, b2) => b1.description.localeCompare(b2.description) * dir)
        } else if (sortField === 'severity') {
            bugsToDisplay.sort((b1, b2) => (b1.severity - b2.severity) * dir)
        } else if (sortField === 'createdAt') {
            bugsToDisplay.sort((b1, b2) => (b1.createdAt - b2.createdAt) * dir)
        }
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
    if (!bugToSave.labels) {
        bugToSave.labels = []
    }
    if (bugToSave._id) {
        const idx = bugs.findIndex(bug => bug._id === bugToSave._id)

        if (idx === -1) {
            loggerService.error(`Couldnt find bug ${bugToSave._id} in bugService`)
            return Promise.reject('Couldt save bug')
        }
        bugs.splice(idx, 1, bugToSave)
    } else {
        bugToSave._id = makeId()
        bugToSave.createdAt = Date.now()
        bugs.push(bugToSave)
    }
    return _saveBugs()
        .then(() => bugToSave)
}

function getLabels() {
    return query()
        .then(bugs => {
            return [...new Set(bugs.flatMap(bug => bug.labels))]
        })
}

function getSortFields() {
    return Promise.resolve([
        'title',
        'description',
        'severity',
        'createdAt'
    ])
}