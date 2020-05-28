const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const path = require("path");

const db = require("./db");
const collection = "todo";

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
app.post("/", (req, res) => {
    console.log("in post");
    const userInput = req.body;

    // connect to the database
    db.getDB().collection(collection).insertOne(userInput, (err, result) => {
        // in production, you'll want to do more, like displaying an error message to the user
        if (err) {
            console.log(err);
        } else {
            res.json({result: result, document: result.ops[0]});
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