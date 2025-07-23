import express from 'express'

// App Init
const app = express()

// App Routing
app.get('/', (req, res) => res.send('Hello there'))

// App Settings
const port = 3030
app.listen(port, () => console.log(`Server listening on port https://127.0.0.1:${port}/`))
