const express = require('express')
var { graphqlHTTP } = require('express-graphql');
const jwt = require('jsonwebtoken')
require('dotenv').config();
const mongoose = require('mongoose')
const isAuth = require('./middleware/auth')

const app = express()
var PORT = 5000

const schema = require('./schema/schema')

const getLoggedInUser = req => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1];
    if(token) {
        try{
            return jwt.verify(token, process.env.JWT_SECRET)
        }catch(error){
            throw new Error('Session expired');
        }
    }
}

app.use(isAuth)
app.use('/graphql', graphqlHTTP({
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

app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})
