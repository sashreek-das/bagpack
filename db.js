const mongoose = require('mongoose');
const { number } = require('zod');

const uri = "mongodb+srv://21051167:PvnK4ohJRc4zHJTd@cluster0.9x7llre.mongodb.net/";

mongoose.connect(uri)
    .then(() => {
        console.log('Successfully connected to the database');
    })
    .catch((error) => {
        console.error('Error connecting to the database', error);
    });

// Connection event listeners
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to the database');
});

mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected from the database');
});

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    }
});

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    balance: {
        type: Number,
        required: true
    }
});

const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account", accountSchema);

module.exports = {
    User,
    Account
};
