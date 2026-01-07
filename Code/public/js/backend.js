// Function to register a user
async function registerUser() {
    //Retrieve data
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const vPassword = document.getElementById('regVerifyPassword').value;

    //Check if fields are empty
    if (!username || !email || !password || !vPassword) {
        document.getElementById('regErrorMessage').innerText = "Please fill in all fields.";
        return;
    }

    const formData = {
        username: username,
        email: email,
        password: password,
        vPassword: vPassword
    };

    try {
        //Send a POST request to the server for registration
        const response = await fetch('/M00912746/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        //Parse the response JSON data
        const data = await response.json();

        //Check if the response is okay
        if (response.ok) {
            //Display the login
            if (data.registration) {
                display('login');
            } else {
                //Handle errors
                if (data.error) {
                    document.getElementById('regErrorMessage').innerText = data.error;
                } else {
                    document.getElementById('regErrorMessage').innerText = 'Registration failed.';
                }
            }
        } else {
            //Handle non-OK response status
            document.getElementById('regErrorMessage').innerText = data.error;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to login to the website
async function loginUser() {
    //Retrieve data
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;


    //Check if fields are empty
    if (!username || !password) {
        document.getElementById('errorMessage').innerText = "Please fill in all fields.";
        return;
    }

    const formData = {
        username: username,
        password: password
    };

    try {
        //Send a POST request to the server for login
        const response = await fetch('/M00912746/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        //Parse the response JSON data
        const data = await response.json();

        //Check if the response is okay
        if (response.ok) {
            // Check if login was successful
            if (data.login) {
                //Display the homepage
                display('homePage');
            } else {
                //Handle incorrect username or password
                if (data.error === 'Username does not exist.') {
                    document.getElementById('errorMessage').innerText = 'Username does not exist.';
                } else if (data.error === 'Incorrect password.') {
                    document.getElementById('errorMessage').innerText = 'Incorrect password.';
                }
            }
        } else {
            //Handle non-OK response status
            document.getElementById('errorMessage').innerText = data.error;
        }
    } catch (error) {
        //Handle other errors
        console.error('Error logging in:', error.message);
    }
}

// Function to create a post
async function post(id) {
    let chosenPostContentId;
    if (id == "feed") {
        chosenPostContentId = 'postContent1';
    } else if (id == "popup") {
        chosenPostContentId = 'postContent2';
    }

    const textContent = document.getElementById(chosenPostContentId).value;
    const imageFile = null;

    //Check if text content is empty
    if (textContent == "") {
        return;
    }

    const postData = {
        textContent: textContent,
        image: imageFile
    };

    try {
        const response = await fetch('/M00912746/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        const data = await response.json();

        if (response.ok) {
            await fetchPostData();
            document.getElementById(chosenPostContentId).value = '';
        }
    } catch (error) {
        console.error('Error posting post:', error);
    }
}

//Function to fetch the JSON data from the server
async function fetchPostData() {
    try {
        // Make a GET request to the server endpoint that serves the JSON data
        const response = await fetch('/M00912746/getPosts');

        // Parse the response JSON data
        const jsonData = await response.json();

        // Fetch the list of users that the current user follows
        const followingUsers = await getFollowingUsers();

        const response2 = await fetch('/M00912746/getUser');
        const currentUser = await response2.json();

        followingUsers.push(currentUser.username);

        // Filter posts to include only those from the users the current user follows
        const filteredPosts = jsonData.filter(post => followingUsers.includes(post.username));

        filteredPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const container = document.getElementById('feed');

        // Display data to the webpage
        for (const postData of filteredPosts) {
            await displayPost(postData, container);
        }

    } catch (error) {
        console.error('Error fetching post data:', error);
    }
}


//Function to fetch the profile picture URL
async function fetchProfilePicUrl(username) {
    try {
        const response = await fetch('/M00912746/findUserProfilePic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });

        const userData = await response.json();
        return userData.profilePicture;
    } catch (error) {
        console.error('Error fetching profile picture URL:', error);
        return "images/profileImg/defaultProfilePicture.jpg";
    }
}

//Function to display the post data on the webpage
async function displayPost(jsonData, container) {
    //Create a div element to hold the post
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');

    // Fetch the user's profile picture URL
    const profilePicUrl = await fetchProfilePicUrl(jsonData.username);

    //Create an image element for the profile picture
    const profilePic = document.createElement('img');
    profilePic.classList.add('profilePic');
    profilePic.src = profilePicUrl;
    postDiv.appendChild(profilePic);

    //Create a heading element for the username
    const usernameHeading = document.createElement('h2');
    usernameHeading.textContent = jsonData.username;
    postDiv.appendChild(usernameHeading);

    //Create a paragraph element for the timestamp
    const timestamp = document.createElement('p');
    timestamp.textContent = jsonData.timestamp;
    timestamp.classList.add('timestamp');
    postDiv.appendChild(timestamp);

    //Create a paragraph element for the text content
    const textContent = document.createElement('p');
    textContent.textContent = jsonData.text;
    postDiv.appendChild(textContent);

    //Check if the post contains an image
    if (jsonData.image) {
        //Create an image element for the post image
        const postImage = document.createElement('img');
        postImage.src = jsonData.image;
        postImage.classList.add('postImage');
        postDiv.appendChild(postImage);
    }

    //Create buttons for likes and comments
    const likeButton = document.createElement('button');
    likeButton.classList.add('likeButton');
    postDiv.appendChild(likeButton);

    const commentButton = document.createElement('button');
    commentButton.classList.add('commentButton');
    const commentIcon = document.createElement('i');
    commentIcon.classList.add('bx', 'bxs-comment');
    commentButton.appendChild(commentIcon);
    postDiv.appendChild(commentButton);

    //Append the postDiv to the desired container in your HTML
    container.appendChild(postDiv);

}


// Function to handle user search
async function searchUsers() {
    const searchQuery = document.getElementById('searchBar').value.trim();

    try {
        // Make a POST request to the server endpoint for searching users
        const response = await fetch('/M00912746/searchUsers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: searchQuery })
        });

        // Parse the response JSON data
        const searchData = await response.json();
        display('search');
        // Display the search results on the webpage
        displaySearchUsersResults(searchData);
    } catch (error) {
        console.error('Error searching users:', error);
    }
}

// Function to handle post search
async function searchPosts() {
    const searchQuery = document.getElementById('searchBar').value.trim();

    try {
        // Make a POST request to the server endpoint for searching posts
        const response = await fetch('/M00912746/searchPosts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query: searchQuery })
        });

        // Parse the response JSON data
        const searchData = await response.json();

        // Display the search results on the webpage
        displaySearchPostsResults(searchData);
    } catch (error) {
        console.error('Error searching posts:', error);
    }
}

// Function to fetch the profile picture URL
async function fetchProfilePicUrl(username) {
    try {
        const response = await fetch('/M00912746/findUserProfilePic', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });

        const userData = await response.json();
        return userData.profilePicture;
    } catch (error) {
        console.error('Error fetching profile picture URL:', error);
        return "images/profileImg/defaultProfilePicture.jpg";
    }
}

// Function to retrieve aa users followers
async function getFollowingUsers() {
    try {
        const response = await fetch('/M00912746/getFollowingUsers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const followingUsers = await response.json();
            return followingUsers;
        } else {
            console.error('Failed to fetch following users:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error fetching following users:', error);
        return [];
    }
}


// Function to display search results on the webpage
async function displaySearchUsersResults(searchData) {
    const searchResultsContainer = document.getElementById('searchUsersPage');
    const followingUsers = await getFollowingUsers();

    // Clear previous search results
    searchResultsContainer.innerHTML = '';

    if (searchData.length === 0) {
        // If no results found, display a message
        searchResultsContainer.style.color = 'white';
        searchResultsContainer.textContent = 'No users found matching your search query.';
    } else {
        // If results found, display each user
        searchData.forEach(user => {
            const userDiv = document.createElement('div');
            userDiv.classList.add('user');

            const profilePic = document.createElement('img');
            profilePic.classList.add('profilePic');
            profilePic.src = user.profilePicture;
            profilePic.alt = 'Profile image';
            userDiv.appendChild(profilePic);

            const usernameHeading = document.createElement('h2');
            usernameHeading.textContent = user.username;
            userDiv.appendChild(usernameHeading);

            const messageButton = document.createElement('button');
            messageButton.classList.add('messageButton');
            messageButton.textContent = 'Message';
            userDiv.appendChild(messageButton);

            const followButton = document.createElement('button');
            followButton.classList.add('followButton');

            // Check if the current user is following this user
            if (followingUsers.includes(user.username)) {
                followButton.textContent = 'Unfollow';
            } else {
                followButton.textContent = 'Follow';
            }
            followButton.onclick = function () {
                toggleFollowUser(user.username, followButton.textContent);
                if (followButton.textContent == 'Follow') {
                    followButton.textContent = 'Unfollow';
                } else if (followButton.textContent == 'Unfollow') {
                    followButton.textContent = 'Follow';
                }
            };


            userDiv.appendChild(followButton);

            searchResultsContainer.appendChild(userDiv);
        });
    }
}

// Function to display search results for posts on the webpage
async function displaySearchPostsResults(searchData) {
    const searchResultsContainer = document.getElementById('searchPostPage');
    const searchUserContainer = document.getElementById('searchUsersPage');

    // Clear previous search results
    searchUserContainer.innerHTML = '';
    searchResultsContainer.innerHTML = '';

    if (searchData.length === 0) {
        // If no results found, display a message
        searchResultsContainer.style.color = 'white';
        searchResultsContainer.textContent = 'No posts found matching your search query.';
    } else {
        // If results found, display each post
        for (const post of searchData) {
            try {
                // Create a div element to hold the post
                const postDiv = document.createElement('div');
                postDiv.classList.add('post');

                // Fetch the user's profile picture URL
                const profilePicUrl = await fetchProfilePicUrl(post.username);

                // Create an image element for the profile picture
                const profilePic = document.createElement('img');
                profilePic.classList.add('profilePic');
                profilePic.src = profilePicUrl;
                postDiv.appendChild(profilePic);

                // Create a heading element for the username
                const usernameHeading = document.createElement('h2');
                usernameHeading.textContent = post.username;
                postDiv.appendChild(usernameHeading);

                // Create a paragraph element for the timestamp
                const timestamp = document.createElement('p');
                timestamp.textContent = post.timestamp;
                timestamp.classList.add('timestamp');
                postDiv.appendChild(timestamp);

                // Create a paragraph element for the text content
                const textContent = document.createElement('p');
                textContent.textContent = post.text;
                postDiv.appendChild(textContent);

                // Check if the post contains an image
                if (post.image) {
                    // Create an image element for the post image
                    const postImage = document.createElement('img');
                    postImage.src = post.image;
                    postImage.classList.add('postImage');
                    postDiv.appendChild(postImage);
                }

                // Create buttons for likes and comments
                const likeButton = document.createElement('button');
                likeButton.classList.add('likeButton');
                postDiv.appendChild(likeButton);

                const commentButton = document.createElement('button');
                commentButton.classList.add('commentButton');
                const commentIcon = document.createElement('i');
                commentIcon.classList.add('bx', 'bxs-comment');
                commentButton.appendChild(commentIcon);
                postDiv.appendChild(commentButton);

                searchResultsContainer.appendChild(postDiv);
            } catch (error) {
                console.error('Error displaying post:', error);
            }
        }
    }
}

// Function to follow or unfollow a user
async function toggleFollowUser(username, action) {
    try {
        let endpoint;
        if (action == 'Follow') {
            endpoint = '/M00912746/followUser';
        } else if (action == 'Unfollow') {
            endpoint = '/M00912746/unfollowUser';
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username })
        });

        if (!response.ok) {
            // Handle error response from the server
            console.error('Error toggling follow status:', response.statusText);
        }
    } catch (error) {
        console.error('Error toggling follow status:', error);
    }
}