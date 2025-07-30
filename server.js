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
        txt: req.params.txt,
        minSeverity: +req.params.minSeverity
    }

    bugService.query(filterBy)
        .then(bugs => res.send(bugs))
        .catch(err => {
            loggerService.error('Cannot get cars', err)
            res.status(400).send('Cannot load cars')
        })
})

//* Create

app.get('/api/bug/save', (req, res) => {
    const { _id, title, description, severity, createdAt } = req.query
    const bugToSave = {
        _id,
        title,
        description,
        severity: +severity,
        createdAt: +createdAt
    }

    bugService.save(bugToSave)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

//* Update

//* Get / Read By ID

//* Remive / Delete


app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const bugId = req.params.bugId
    console.log(bugId)

    bugService.remove(bugId)
        .then(() => res.send(`bug ${bugId} deleted`))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send(err)
        })
})

// App Settings
const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port https://127.0.0.1:${port}/`))
