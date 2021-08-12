require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Entry = require('./models/entry')

const app = express()

// Middleware
app.use(express.static('build'))
app.use(express.json())
app.use(cors())

// configure morgan to show extra info for POST
morgan.token('post', (request, response) => {
    if(request.method === "POST") {
        return JSON.stringify(request.body)
    } else {
        return ""
    }
})
app.use(morgan(":method :url :status :res[content-length] - :response-time ms :post"))



const errorHandler = (error, request, response, next) => {
    console.log(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message})
    }
    
    next(error)
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'unknown endpoint'})
}


app.get('/info', (req, res) => {
    Entry.find({})
    .then(results => 
        res.send(`<p>Phonebook has info for ${results.length} people</p> <p>${Date()}`)
        )
})

app.get('/api/persons', (req, res) => {
    Entry.find({}).then(entries => {
        res.json(entries)
    })
})

app.get('/api/persons/:id', (req, res, next) => {
   Entry.findById(req.params.id)
   .then(entry => {
        if (entry) {
            res.json(entry)
        } else {
            res.status(404).end()
        }
   })
   .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Entry.findByIdAndRemove(req.params.id)
    .then(entry => {
        res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
    if (!req.body.name) {
        return res.status(400).json({error: 'name is missing'})        
    } else if (!req.body.number) {
        return res.status(400).json({error: 'number is missing'})
    } 

    const entry = new Entry( {
        name: req.body.name,
        number: req.body.number
    })

    entry.save().then(result => {
        res.json(entry)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
    const entry = {
        name: req.body.name,
        number: req.body.number,
    }

    Entry.findByIdAndUpdate(req.params.id, entry, {new: true})
    .then(updatedEntry => {
        res.json(updatedEntry)
    })
    .catch(error => next(error))
})



app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})





