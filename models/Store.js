const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    imageurl:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Store',storeSchema)
