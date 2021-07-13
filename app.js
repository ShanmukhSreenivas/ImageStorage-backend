const express = require('express')
var { graphqlHTTP } = require('express-graphql');
//const jwt = require('jsonwebtoken')
require('dotenv').config();
const mongoose = require('mongoose')
//const bodyParser = require('body-parser-graphql')
const cors = require('cors')

const app = express()
var PORT = 5000

const schema = require('./schema/schema')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cors());
app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true,
    context: ({ req, res }) => ({ req, res }),
}))


try{
    mongoose.promise = global.Promise;
    mongoose.connect('mongodb+srv://dbUser:atlaspassword@cluster0.bghub.mongodb.net/Image_storage?retryWrites=true&w=majority',
    {
        useNewUrlParser : true ,
        useUnifiedTopology: true
    })
    mongoose.set('debug', true);
    mongoose.connection.once('open', ()=>{
        console.log("Connected to database cluster ImageStorage")
    })
}
catch(err){
    console.log(err)
}

app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})
