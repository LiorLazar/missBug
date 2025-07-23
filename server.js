import express from 'express'
import { bugService } from './services/bug.service.js'

// App Init
const app = express()

// App Routing
app.get('/', (req, res) => res.send('Hello there'))

app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => res.send(bugs))
})

app.get('/api/bug/:id', (req, res) => {
    const bugId = req.params.id

    bugService.getById(bugId)
        .then(bug => res.send(bug))
})

// App Settings
const port = 3030
app.listen(port, () => console.log(`Server listening on port https://127.0.0.1:${port}/`))
