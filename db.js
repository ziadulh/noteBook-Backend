const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const mongoURL = "mongodb://127.0.0.1:27017/test";

const connectToMongo = () => {
    mongoose.connect(mongoURL, () => {
        console.log("connected to Mongo successfully!");
    });
}

module.exports = connectToMongo;