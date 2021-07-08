const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema({
    //imageId: String,
    userId: String,
    imageurl: String,
})

module.exports = mongoose.model('Store',storeSchema)
