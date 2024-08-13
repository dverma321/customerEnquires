const mongoose = require('mongoose')
const jwt = require('jsonwebtoken'); // Import jsonwebtoken


const Schema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    confirmPassword: String,    
    isAdmin: Boolean,    

    createdAt: { type: Date, default: Date.now }, // Adding createdAt field with default value as current date/time

    tokens: [
        {
            token: {
                type: String,
                require: true
            }
        }

    ],

      // Adding messages field to store user messages
      messages: [
        {
            message: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],


})

// we are generating token

Schema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign(
            {
                _id: this._id

            },
            process.env.JWT_SECRET

        ); // token generated

        this.tokens = this.tokens.concat({ token: token }); // token stored in the database

        await this.save();
        console.log("Token Generated : ", token);

        return token;
    }
    catch (err) {
        console.log("Catch Error :", err);

    }
}


const User = mongoose.model('UserData', Schema);
module.exports = User
