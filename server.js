import path from 'path'

import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.service.js'

//* Express Config:
const app = express()
app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())
app.set('query parser', 'extended')

////////////////////////////////////////////////////
//* Express Routing:
//* Bug API:
//* Read
app.get('/api/bug', (req, res) => {
    console.log(req.query)

    // Parse sortBy if it's a JSON string
    let sortBy = req.query.sortBy
    if (typeof sortBy === 'string' && sortBy) {
        try {
            sortBy = JSON.parse(sortBy)
        } catch (error) {
            sortBy = null
        }
    }

    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        sortBy: sortBy,
        pageIdx: req.query.pageIdx !== undefined ? +req.query.pageIdx : undefined,
        labels: req.query.labels,
        ownerId: req.query.ownerId
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

//* Read SortFields
app.get('/api/bug/sortFields', (req, res) => {
    bugService.getSortFields()
        .then(fields => {
            res.send(fields)
            loggerService.debug('Requested sortFields Passed Successfully.')
        })
        .catch(err => {
            loggerService.error('Cannot get sortFields', err)
            res.status(400).send('Cannot load sortFields')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    const loggedInUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(400).send('Cannot add bug')

    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        labels: req.body.labels,
    }

    bugService.save(bugToSave, loggedInUser)
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
    const loggedInUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(400).send('Cannot update bug')

    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: +req.body.createdAt,
        labels: req.body.labels,
    }

    bugService.save(bugToSave, loggedInUser)
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
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot delete bug')
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

////////////////////////////////////////////////////

//* User API
//* Read:
app.get('/api/user', (req, res) => {
    userService.query()
        .then(users => {
            res.send(users)
            loggerService.debug('Users Queried Successfully')
        })
        .catch(err => {
            loggerService.error('Cannot get users', err)
            res.status(400).send('Cannot get users')
        })

})

//* Get By ID:
app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params
    userService.getById(userId)
        .then(user => {
            res.send(user)
            loggerService.debug(`Requested User - ${user._id} - Full Requested User: ${JSON.stringify(user)}`)
        })
        .catch(err => {
            loggerService.error(`Cannot get user with ID: ${userId}:`, err)
            res.status(400).send('Cannot get user')
        })
})

////////////////////////////////////////////////////
//* Auth API:
//* Login
app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
            loggerService.debug(`User ${user.username} with ID ${user._id} has connected successfully.`)
        })
        .catch(err => {
            res.status(400).send('Invalid Credentials')
            loggerService.error(`Invalid Credentials`, err)
        })
})

//* Signup
app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService.add(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
                loggerService.debug(`User ${user.username} with ID ${user._id} has registed and connected successfully.`)
            }
            else {
                res.status(400).send('Cannot signup')
                loggerService.error('User Tried to sign up with exsiting user.')
            }
        })
        .catch(err => {
            res.status(400).send('username taken')
            loggerService.error('User Tried to sign up with exsiting user.', err)
        })
})

//* Logout
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged out')
})

//* Fallback route (For production or when using browser-router)
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

const port = 3030
app.listen(port, () => loggerService.info(`Server listening on port https://127.0.0.1:${port}/`))
