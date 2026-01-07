const express = require('express');
const expressSession = require('express-session');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;
const {
    usersCollection,
    commentsCollection,
    likesCollection,
    notificationsCollection,
    postsCollection,
    repliesCollection
} = require('./data_server');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

//Set up session
app.use(
    expressSession({
        secret: 'persona5Connect',
        cookie: { maxAge: 60000 },
        resave: false,
        saveUninitialized: true
    })
);

//Regex
const usernameRegex = /^([a-zA-Z0-9])+$/;
const emailRegex = /^([a-z A-Z 0-9 .-_]+)@([a-z A-Z]+).([a-z A-Z]{2,6})(.[a-z]{2,6})?$/;
const passwordRegex = /^([a-z A-Z 0-9 @$!%*#?&])+$/;


//Register
app.post('/M00912746/register', async (req, res) => {
    try {
        const newUser = req.body;

        //Check if username length is within 3-12 characters
        if (newUser.username.length < 3 || newUser.username.length > 12) {
            return res.send({ error: 'Username must be between 3 and 12 characters.' });
        }

        //Check if username contains only certain characters
        if (!usernameRegex.test(newUser.username)) {
            return res.send({ error: 'Username can only consist of letters and numbers.' });
        }

        //Check if username already exists
        const existingUsername = await usersCollection.findOne({ username: newUser.username });
        if (existingUsername) {
            return res.send({ error: 'Username already exists.' });
        }

        //Check if email format is valid
        if (!emailRegex.test(newUser.email)) {
            return res.send({ error: 'Invalid email.' });
        }

        //Check if email already exists
        const existingEmail = await usersCollection.findOne({ email: newUser.email });
        if (existingEmail) {
            return res.send({ error: 'Email already exists.' });
        }

        //Check if password meets length criteria
        if (newUser.password.length < 8 || newUser.password.length > 16) {
            return res.send({ error: 'Password must be between 8 and 16 characters.' });
        }

        //Check if password contains only certain characters
        if (!passwordRegex.test(newUser.password)) {
            return res.send({ error: 'Password can only consist of letters, numbers and symbols.' });
        }

        //Check if password meets complexity criteria
        if (!/[a-z]/.test(newUser.password) || !/[A-Z]/.test(newUser.password) || !/[0-9]/.test(newUser.password)) {
            return res.send({ error: 'Password must include at least one lowercase letter, one uppercase letter, and one number.' });
        }

        // Check if password and verify password match
        if (newUser.password !== newUser.vPassword) {
            return res.send({ error: 'Passwords do not match.' });
        }

        //Registeration successful
        const user = {
            username: newUser.username,
            email: newUser.email,
            password: newUser.password,
            profilePicture: "images/profileImg/defaultProfilePicture.jpg",
            status: " ",
            following: [],
            followers: [],
            lastActive: new Date()
        };
        await usersCollection.insertOne(user);
        return res.send('{ "registration": true }');
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).send('Internal server error');
    }
});

//Login 
app.post('/M00912746/login', async (req, res) => {
    let usrlogin = req.body;

    try {
        //Find a user in the database that matches the username
        const user = await usersCollection.findOne({ username: usrlogin.username });

        //If the username deos not exist
        if (!user) {
            return res.send('{ "login": false, "error": "Username does not exist." }');
        }

        //If the password is incorrect
        if (user.password !== usrlogin.password) {
            return res.send('{ "login": false, "error": "Incorrect password." }');
        }

        //Login successful
        await usersCollection.updateOne(
            { username: usrlogin.username },
            { $set: { lastActive: new Date() } }
        );

        req.session.user = user;
        req.session.isLoggedIn = true; 
        return res.send('{ "login": true }');

    } catch (error) {
        console.error('Error finding user:', error);
        return res.status(500).json({ login: false, message: 'Internal server error' });
    }
});

//Retrieves all post data
app.get('/M00912746/getPosts', async (req, res) => {
    try {

        //Fetch all documents from the collection
        const postData = postsCollection.find({});
        const jsonData = await postData.toArray();

        // Send the JSON data as response
        res.json(jsonData);
    } catch (error) {
        console.error('Error fetching post data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Post
app.post('/M00912746/post', async (req, res) => {
    try {
        const post = req.body;

        const newPost = {
            username: req.session.user.username,
            text: post.textContent,
            image: post.image,
            timestamp: new Date(),
            likes: 0,
            comments: []
        };
        await postsCollection.insertOne(newPost);
        return res.send('{ "post": true }');
    } catch (error) {
        console.error('Error posting post:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

//Retrieves the user's profile picture URL
app.post('/M00912746/findUserProfilePic', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await usersCollection.findOne({ username });

        if (user) {
            res.json({ profilePicture: user.profilePicture });
        } else {
            res.json({ profilePicture: "images/profileImg/defaultProfilePicture.jpg" });
        }
    } catch (error) {
        console.error('Error fetching profile picture URL:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Handle user searches
app.post('/M00912746/searchUsers', async (req, res) => {
    try {
        const { query } = req.body;

        const matchingUsers = await usersCollection.find({ 
            $and: [
                { username: { $regex: query, $options: 'i' } },
                { username: { $ne: req.session.user.username } }
            ]
        }).toArray();

        res.json(matchingUsers);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Handle post searches
app.post('/M00912746/searchPosts', async (req, res) => {
    try {
        const { query } = req.body;

        const searchResults = await postsCollection.find({ text: { $regex: query, $options: 'i' } }).toArray();

        res.json(searchResults);
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//Retrieve all following users
app.get('/M00912746/getFollowingUsers', async (req, res) => {
    try {
        //Find the user document for the current user
        const currentUser = await usersCollection.findOne({ username: req.session.user.username });

        //Return the list of following users in the response
        res.json(currentUser.following);
    } catch (error) {
        console.error('Error fetching following users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//following a user
app.post('/M00912746/followUser', async (req, res) => {
    try {
        const { username } = req.body;

        // Update the current user's following list to include the target user
        await usersCollection.updateOne(
            { username: req.session.user.username },
            { $addToSet: { following: username } }
        );

        // Update the target user's followers list to include the current user
        await usersCollection.updateOne(
            { username: username },
            { $addToSet: { followers: req.session.user.username } }
        );

        // Respond with success status code
        res.status(200).json({ message: 'User followed successfully' });
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//unfollowing a user
app.post('/M00912746/unfollowUser', async (req, res) => {
    try {
        const { username } = req.body;

        // Update the current user's following list to remove the target user
        await usersCollection.updateOne(
            { username: req.session.user.username },
            { $pull: { following: username } }
        );
        
        //Update the target user's followers list to remove the current user
        await usersCollection.updateOne(
            { username: username },
            { $pull: { followers: req.session.user.username } }
        );

        // Respond with success status code
        res.status(200).json({ message: 'User unfollowed successfully' });
    } catch (error) {
        console.error('Error unfollowing user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//Gets the current user
app.get('/M00912746/getUser', (req, res) => {
    try {
    res.json(req.session.user);
} catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ error: 'Internal server error' });
}
});

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});