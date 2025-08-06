const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    const [labels, setLabels] = useState([])
    const [sortFields, setSortFields] = useState([])

    useEffect(() => {
        loadBugs()
        loadLabels()
        loadSortFields()
    }, [filterBy])

    function loadLabels() {
        bugService.getLabels()
            .then(setLabels)
    }

    function loadSortFields() {
        bugService.getSortFields()
            .then(setSortFields)
    }

    function loadBugs() {
        bugService.query(filterBy)
            .then(setBugs)
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const title = prompt('Bug title?', 'Bug ' + Date.now())
        const severity = +prompt('Bug severity?', 3)
        const description = prompt('Bug Description?')
        const labelsInput = prompt('Labels (comma-separated)?', 'ui, bug')

        const bug = {
            title,
            severity,
            description,
            labels: labelsInput ? labelsInput.split(',').map(label => label.trim()) : []
        }

        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?', bug.severity)
        const description = prompt('New Description', bug.description)
        const bugToSave = { ...bug, severity, description }

        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)

                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    function onTogglePagination() {
        setFilterBy(prevFilter => {
            return {
                ...prevFilter,
                pageIdx: (prevFilter.pageIdx === undefined) ? 0 : undefined
            }
        })
    }

    function onChangePage(diff) {
        if (filterBy.pageIdx === undefined) return
        setFilterBy(prevFilter => {
            let nextPageIdx = prevFilter.pageIdx + diff
            if (nextPageIdx < 0) nextPageIdx = 0
            // if (nextPageIdx > MAX_PAGE) nextPageIdx = MAX_PAGE
            return { ...prevFilter, pageIdx: nextPageIdx }
        })
    }

    return <section className="bug-index main-content">

        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} labels={labels} sortFields={sortFields} />
        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
            <section>
                <button onClick={onTogglePagination}>
                    Toggle Pagination
                </button>
                <button onClick={() => onChangePage(-1)}>-</button>
                <span>{filterBy.pageIdx + 1 || 'No Pagination'}</span>
                <button onClick={() => onChangePage(1)}>+</button>
            </section>
        </header>

        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />
    </section>
}
