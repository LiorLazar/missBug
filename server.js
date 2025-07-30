import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'

//* Express Config:
const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

//* Express Routing:
//* Read
app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt,
        minSeverity: +req.query.minSeverity,
        sortBy: req.query.sortBy,
        sortDir: req.query.sortDir,
        pageIdx: req.query.pageIdx,
        labels: req.query.labels
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get cars', err)
            res.status(400).send('Cannot load cars')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    // const { _id, title, description, severity, createdAt } = req.query
    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: Date.now()
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
app.put('/api/bug/:bugId', (req, res) => {
    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: +req.body.createdAt
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
        .then(bug => {
            res.send(`Bug removed - ${bugId}`)
            loggerService.debug(`Bug ${bugId} has been removed successfully.`)
        })
        .catch(err => {
            loggerService.error(`Cannot remove bug: `, err)
            res.status(400).send('Cannot remove bug')
        })
})

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port https://127.0.0.1:${port}/`))
