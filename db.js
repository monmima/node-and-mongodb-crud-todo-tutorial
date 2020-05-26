const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;
const dbname = "crud_mongodb";

// default location of your database
const url = "mongodb://localhost:27017";
const mongoOptions = {useNewUrlParser : true};

// means we don't have a db yet
const state = {
    db : null, 
};

// cb = callback
const connect = (cb) => {
    if (state.db) {
        cb();
    // if there isn't a db connection
    } else {
        // use MongoClient to connect to the db
        MongoClient.connect(url, mongoOptions, (err, client) => {
            if (err) {
                cb(err);
            } else {
                state.db = client.db(dbname);
                cb();
            }
        });
    }
}

const getPrimaryKey = (_id) => {
    // queries the db by the primary key
    return ObjectID(_id);
}

const getDB = () => {
    return state.db;
}

module.exports = {getDB, connect, getPrimaryKey};