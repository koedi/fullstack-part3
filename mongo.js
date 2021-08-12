const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fsmongo:${password}@cluster0.q4ahp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true, useCreateIndex: true})
const entrySchema = new mongoose.Schema({
    name: String, 
    number: String
})

const Entry = mongoose.model('Entry', entrySchema)

if (process.argv.length === 5) {
    const entry = new Entry( {
        name: process.argv[3],
        number: process.argv[4]
    })

    entry.save().then(result => {
        console.log('number saved')
        mongoose.connection.close()
    })

} else {
    Entry.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(entry => {
            console.log(entry.name + ' ' + entry.number) 
        })
        mongoose.connection.close()
    })
    
}







