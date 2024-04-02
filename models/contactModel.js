const mongoose = require("mongoose");
const { Schema } = require("mongoose");

const User = new Schema({
    phoneNumber:{
        type: String,
        required: false,
    },
    email:{
        type: String,
        required: false,
    },
    linkedId:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    linkedPrecedence:{
        type: String,
        enum: ["primary", "secondary"],
        required: false,
    }
})

module.exports = mongoose.model("User", User);