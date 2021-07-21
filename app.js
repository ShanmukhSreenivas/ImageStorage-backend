const express = require('express')
var { graphqlHTTP } = require('express-graphql');
require('dotenv').config();
const mongoose = require('mongoose')

const app = express()
var PORT = 5000

const schema = require('./schema/schema')


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());
app.use('/graphql', graphqlHTTP((req,res) => ({
    schema: schema,
    graphiql: true,
    context: { req, res }
})))


try{
    mongoose.promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI,
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
