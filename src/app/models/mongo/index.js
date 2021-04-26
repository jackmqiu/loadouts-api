const MongoClient = require('mongodb').MongoClient

// MongoClient.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dtjm7.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`, (err, client) => {
//   if (err) return console.error(err)
//   console.log('Connected to Database')
// })
//
export default MongoClient
