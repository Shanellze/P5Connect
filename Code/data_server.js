const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const connectionURL ='mongodb://127.0.0.1:27017?retryWrites=true&w=majority';

//Set up client
const client = new MongoClient(connectionURL, { 
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false, //Setting this to true breaks text index queries.
        deprecationErrors: true,
    }
}); 

//Use client to create database and collection
const database = client.db("data");
const usersCollection = database.collection("users");
const commentsCollection = database.collection("comments");
const likesCollection = database.collection("likes");
const notificationsCollection = database.collection("notifications");
const postsCollection = database.collection("posts");
const repliesCollection = database.collection("replies");

module.exports = {
    usersCollection,
    commentsCollection,
    likesCollection,
    notificationsCollection,
    postsCollection,
    repliesCollection
};