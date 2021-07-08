const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const jwt = require('jsonwebtoken')
require('dotenv').config();
const mongoose = require('mongoose')


const app = express()

const schema = require('./schema/schema')


const getLoggedInUser = req => {
    const token = req.headers['x-auth-token'];
    if(token) {
        try{
            return jwt.verify(token, process.env.JWT_SECRET)
        }catch(error){
            throw new Error('Session expired');
        }
    }
}

app.use(bodyParser.json())
app.use('./graphql', graphqlHttp.graphqlHTTP({
    schema: schema,
    graphiql: true,
    context: ({ req, res }) => ({
        req,
        res,
        me: getLoggedInUser(req)
    })
}))

try{
    mongoose.connect('mongodb+srv://dbUser:atlaspassword@cluster0.bghub.mongodb.net/Image_storage?retryWrites=true&w=majority',
    {
        useNewUrlParser : true ,
        useUnifiedTopology: true
    })

    mongoose.connection.once('open', ()=>{
        console.log("Connected to database cluster ImageStorage")
    })
}
catch(err){
    console.log(err)
}

app.listen(5000., () => console.log('Server running at port 5000'))
