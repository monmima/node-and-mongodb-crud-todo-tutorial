const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const Joi = require("joi");

const db = require("./db");
const collection = "todo";
const app = express();

const schema = Joi.object().keys({
    todo: Joi.string.required()
});

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// read
app.get("/getTodos", (req, res) =>  {
    db.getDB().collection(collection).find({}).toArray((err, documents) => {
        if (err) {
            console.log(err);
        } else {
            console.log(documents);
            res.json(documents);
        }
    });
});

// update
app.put("/:id", (req, res) => {
    const todoID = req.params.id;
    const userInput = req.body;

    // connect to the database
    db.getDB().collection(collection).findOneAndUpdate({_id: db.getPrimaryKey(todoID)}, {$set: {todo: userInput.todo}}, {returnOriginal: false}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});

// create
app.post("/", (req, res, next) => {
    console.log("in post");
    const userInput = req.body;

    Joi.validate(userInput, schema, (err, result) => {
        if (err) {
            const error = new Error("Invalid Input");
            error.status = 400;
            next(error);
        } else {
            // connect to the database
            db.getDB().collection(collection).insertOne(userInput, (err, result) => {
                // in production, you'll want to do more, like displaying an error message to the user
                if (err) {
                    const error = new Error("Failed to insert Todo Document");
                    error.status = 400;
                    next(error);
                } else {
                    res.json({result: result, document: result.ops[0], msg: "Successfully inserted Todo!", error: null});
                }
            });
        }
    });
});

// delete
app.delete("/:id", (req, res) => {
    // Primary Key of Todo Document
    const todoID = req.params.id;

    // Find Document By ID and delete document from record
    db.getDB().collection(collection).findOneAndDelete({_id: db.getPrimaryKey(todoID)}, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.json(result);
        }
    });
});

// middleware
app.use((err, req, res, next) => {
    res.status(err.status).json({
        error: {
            message: err.message
        }
    })
});

// connect to the database
db.connect((err) => {
    if (err) {
        console.log("Unable to connect to the datase.");
        process.exit(1);
    } else {
        app.listen(3000, () => {
            console.log("Connected to database, app listening on port 3000.");
        });
    }
});