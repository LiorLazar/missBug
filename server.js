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

app.get('/api/bug/save', (req,res) => {
    
})

app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId

    bugService.getById(bugId)
        .then(bug => res.send(bug))
})

app.get('/api/bug/:bugId/remove', (req, res) => {
    const bugId = req.params.bugId
    console.log(bugId)

    bugService.remove(bugId)
        .then(() => res.send(`bug ${bugId} deleted`))
})

// App Settings
const port = 3030
app.listen(port, () => console.log(`Server listening on port https://127.0.0.1:${port}/`))
