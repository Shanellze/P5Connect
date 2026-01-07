//Display the corrosponding page
async function display(pageID) {
    var divs = document.getElementsByTagName("div");

    //Hide all divs
    for (var i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
    }

    //Hide the search bar
    document.getElementById('searchBar').style.display = 'none';
    document.getElementById('searchBarSubmit').style.display = 'none';

    //Display the contents of the page assosiated to the pageID
    if (pageID == 'login' || pageID == 'registration') {
        document.getElementById(pageID).style.display = 'block';
    } else if (pageID == 'homePage') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        displaySearchBar();
        displayProfileMenu();
        displayFeed();
        displayActiveFollowing();
        displayNewsAndUpdates();
        
        await fetchPostData();

    } else if (pageID == 'profile' || pageID == 'profile2') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        displaySearchBar();
        displayProfileMenu();
        displayProfile(pageID);
        displayActiveFollowing();
        displayNewsAndUpdates();

    } else if (pageID == 'following') {
        displaySearchBar();
        displayProfileMenu();
        displayFollowing();
        displayActiveFollowing();
        displayNewsAndUpdates();

    } else if (pageID == 'messages') {
        displaySearchBar();
        displayProfileMenu();
        displayMessagesPage();

    } else if (pageID == 'notifications') {
        displaySearchBar();
        displayProfileMenu();
        displayNotifications();
        displayActiveFollowing();
        displayNewsAndUpdates();

    } else if (pageID == 'search' || pageID == 'searchUsersPage' || pageID == 'searchPostPage') {
        displaySearchBar();
        displayProfileMenu();

        document.getElementById('searchPage').style.display = 'block';
        if (pageID == 'search' || pageID == 'searchUsersPage') {
            document.getElementById('searchUsersPage').style.display = 'block';
            var users = document.getElementById("searchUsersPage").getElementsByClassName("user");
            for (var i = 0; i < users.length; i++) {
                users[i].style.display = "block";
            }
        } else {
            document.getElementById('searchPostPage').style.display = 'block';
            var posts = document.getElementById('searchPostPage').getElementsByClassName("post");
            var postsArray = Array.from(posts);
            postsArray.forEach(function (element) {
                element.style.display = "block";
    });
        }

        displayActiveFollowing();
        displayNewsAndUpdates();

    } else {
        console.error("Element with ID '" + pageID + "' not found.");
    }
}


//Function to display the search bar
function displaySearchBar() {
    document.getElementById('searchBar').style.display = 'block';
    document.getElementById('searchBarSubmit').style.display = 'block';
}

//Function to display the profile menu
function displayProfileMenu() {
    document.getElementById('profileMenu').style.display = 'block';
    document.getElementById('menuStats').style.display = "block";
    displayStats();
}

//Function to display stats
function displayStats() {
    var statElements = document.getElementsByClassName("stats");
    var statArray = Array.from(statElements);
    statArray.forEach(function (element) {
        element.style.display = "block";
    });
}

//Function to display the feed
function displayFeed() {
    document.getElementById('feed').style.display = 'block';
    document.getElementById('createPost').style.display = 'block';

    var posts = document.getElementsByClassName("post");
    for (var i = 0; i < posts.length; i++) {
        posts[i].style.display = "block";
    }
}

//Function to display a user profile
function displayProfile(profileID) {
    document.getElementById(profileID).style.display = 'block';
    
    var myProfileElements = document.getElementById(profileID).getElementsByClassName("myProfile");
    var myProfileArray = Array.from(myProfileElements);
    myProfileArray.forEach(function (element) {
        element.style.display = "block";
    });

    document.getElementById('profileStats').style.display = "block";
    displayStats();

    var profilePosts = document.getElementById(profileID).getElementsByClassName("post");
    var profilePostsArray = Array.from(profilePosts);
    profilePostsArray.forEach(function (element) {
        element.style.display = "block";
    });
}

//Function to display the following page
function displayFollowing() {
    document.getElementById('followingPage').style.display = 'block';

    document.getElementById('followingContainer').style.display = 'block';
    var followingUsers = document.getElementById("followingContainer").getElementsByClassName("user");
    for (var i = 0; i < followingUsers.length; i++) {
        followingUsers[i].style.display = "block";
    }
}


//Function to display Message page
function displayMessagesPage() {
    document.getElementById('messagesPage').style.display = 'block';
    document.getElementById('messagesBox').style.display = 'block';

    document.getElementById('conversationHistory').style.display = 'block';
    var message = document.getElementsByClassName("message");
    for (var i = 0; i < message.length; i++) {
        message[i].style.display = "block";
    }

    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('chatBox').style.display = 'block';
}

//Function to display notifications
function displayNotifications() {
    document.getElementById('notificationsPage').style.display = 'block';
    document.getElementById('notificationContainer').style.display = 'block';
    document.getElementById('newNotification').style.display = 'block';
    document.getElementById('oldNotification').style.display = 'block';
    var notifs = document.getElementsByClassName("notification");
    for (var i = 0; i < notifs.length; i++) {
        notifs[i].style.display = "block";
    }
}

//Function to display active following
function displayActiveFollowing() {
    document.getElementById('activeFollowing').style.display = 'block';
    document.getElementById('userContainer').style.display = 'block';
    var activeUsers = document.getElementsByClassName("user");
    for (var i = 0; i < activeUsers.length; i++) {
        activeUsers[i].style.display = "block";
    }

}

//Function to display news and updates
function displayNewsAndUpdates() {
    document.getElementById('newsAndUpdates').style.display = 'block';
    document.getElementById('newsAndUpdatesContainer').style.display = 'block';
    var postElements = document.getElementById("newsAndUpdatesContainer").getElementsByClassName("post");
    var postArray = Array.from(postElements);
    postArray.forEach(function (element) {
        element.style.display = "block";
    });
}

//Function to display a popup
function displayPopup(pageID) {
    document.getElementById("overlay").style.display = "block";
    document.getElementById(pageID).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Function to close a popup
function exitPopup(pageID) {
    document.getElementById("overlay").style.display = "none";
    document.getElementById(pageID).style.display = 'none';
    document.body.style.overflow = 'auto';
}