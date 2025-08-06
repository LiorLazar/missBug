import { utilService } from './util.service.js'
import { storageService } from './async-storage.service.js'

const STORAGE_KEY = 'bugs'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy) {
    return storageService.query(STORAGE_KEY)
        .then(bugs => {

            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                bugs = bugs.filter(bug => regExp.test(bug.title))
            }

            if (filterBy.minSeverity) {
                bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
            }

            // Add sorting logic
            if (filterBy.sortBy && filterBy.sortBy.sortField) {
                const { sortField, sortDir } = filterBy.sortBy
                const dir = sortDir || 1

                if (sortField === 'title') {
                    bugs.sort((b1, b2) => b1.title.localeCompare(b2.title) * dir)
                } else if (sortField === 'description') {
                    bugs.sort((b1, b2) => b1.description.localeCompare(b2.description) * dir)
                } else if (sortField === 'severity') {
                    bugs.sort((b1, b2) => (b1.severity - b2.severity) * dir)
                } else if (sortField === 'createdAt') {
                    bugs.sort((b1, b2) => (b1.createdAt - b2.createdAt) * dir)
                }
            }

            return bugs
        })
}

function getById(bugId) {
    return storageService.get(STORAGE_KEY, bugId)
}

function remove(bugId) {
    return storageService.remove(STORAGE_KEY, bugId)
}

function save(bug) {
    if (bug._id) {
        return storageService.put(STORAGE_KEY, bug)
    } else {
        return storageService.post(STORAGE_KEY, bug)
    }
}

function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (bugs && bugs.length > 0) return

    bugs = [
        {
            title: "Infinite Loop Detected",
            description: "Application gets stuck in an endless loop when processing user input",
            severity: 4,
            _id: "1NF1N1T3"
        },
        {
            title: "Keyboard Not Found",
            description: "System fails to detect keyboard input device on startup",
            severity: 3,
            _id: "K3YB0RD"
        },
        {
            title: "404 Coffee Not Found",
            description: "Coffee machine API returns 404 error during morning hours",
            severity: 2,
            _id: "C0FF33"
        },
        {
            title: "Unexpected Response",
            description: "Server returns random goose sounds instead of JSON data",
            severity: 1,
            _id: "G0053"
        }
    ]
    utilService.saveToStorage(STORAGE_KEY, bugs)
}

function getDefaultFilter() {
    return {
        txt: '',
        minSeverity: 0,
        sortBy: null
    }
}