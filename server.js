import path from 'path'

import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

//* Express Config:
const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')

//* Express Routing:
//* Read
app.get('/api/bug', (req, res) => {
    console.log(req.query)
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        sortBy: req.query.sortBy,
        sortDir: req.query.sortDir || 1,
        pageIdx: req.query.pageIdx || 0,
        labels: req.query.labels
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get cars', err)
            res.status(400).send('Cannot load cars')
        })
})

//* Read Labels
app.get('/api/bug/labels', (req, res) => {

    bugService.getLabels()
        .then(labels => {
            res.send(labels)
            loggerService.debug('Requested Labels Passed Successfully.')
        })
        .catch(err => {
            loggerService.error('Cannot get labels', err)
            res.status(400).send('Cannot load labels')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    // const { _id, title, description, severity, createdAt } = req.query
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        labels: req.body.labels,
    }

    bugService.save(bugToSave)
        .then(savedBug => {
            res.send(savedBug)
            loggerService.debug('Created Bug:', savedBug)
        })
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

//* Update
app.put('/api/bug', (req, res) => {
    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: +req.body.createdAt,
        labels: req.body.labels,
    }

    bugService.save(bugToSave)
        .then(bug => {
            res.send(bug)
            loggerService.debug(`Updated Bug ${bug._id} - ${JSON.stringify(bug)}`)
        })
        .catch(err => {
            loggerService.error('cannot update bug', err)
            res.status(400).send('Cannot update bug')
        })
})

//* Get / Read By ID
app.get('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.getById(bugId)
        .then(bug => {
            var visitedBugs = req.cookies.visitedBugs || []

            if (!visitedBugs.includes(bugId)) {
                visitedBugs.push(bugId)

                if (visitedBugs.length > 3) {
                    loggerService.error('User Reached more than 3 bugs in short time')
                    return res.status(401).send('Wait for a bit')
                }

                res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 7 })
            }

            res.send(bug)
            loggerService.debug(`Requested Bug - ${bug._id} - Full Requested Bug: ${JSON.stringify(bug)}`)
        })
        .catch(err => {
            loggerService.error(`Cannot get bug with ID: ${bugId}: `, err)
            res.status(400).send('Cannot get bug')
        })
})
//* Remove / Delete
app.delete('/api/bug/:bugId', (req, res) => {
    const { bugId } = req.params
    bugService.remove(bugId)
        .then(() => {
            res.send(`Bug removed - ${bugId}`)
            loggerService.debug(`Bug ${bugId} has been removed successfully.`)
        })
        .catch(err => {
            loggerService.error(`Cannot remove bug: `, err)
            res.status(400).send('Cannot remove bug')
        })
})

//* Fallback route (For production or when using browser-router)
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port https://127.0.0.1:${port}/`))
