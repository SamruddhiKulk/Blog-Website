

// Function to open the modal and display the blog post
function showBlogModal(title, category, content) {
    // Set the content of the modal
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalCategory").innerText = category;
    document.getElementById("modalContent").innerText = content;

    // Display the modal
    document.getElementById("blogModal").style.display = "block";
}

// Function to close the modal
function closeBlogModal() {
    document.getElementById("blogModal").style.display = "none";
}

// Close the modal if the user clicks outside the modal content
window.onclick = function (event) {
    const modal = document.getElementById("blogModal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
};



document.addEventListener("DOMContentLoaded", () => {
    // Like button functionality
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const blogId = event.target.closest('.blog-post').getAttribute('data-id'); // Assuming blog ID is set as data-id
            const response = await fetch(`/blog/like/${blogId}`, {
                method: 'POST'
            });
            const data = await response.json();
            if (response.ok) {
                event.target.innerHTML = `<i class="fa-solid fa-thumbs-up"></i> Like (${data.likes})`;
            }
        });
    });

    // Comment button functionality
    // document.querySelectorAll('.comment-button').forEach(button => {
    //     button.addEventListener('click', (event) => {
    //         const blogId = event.target.closest('.blog-post').getAttribute('data-id');
    //         const comment = prompt('Enter your comment:');
    //         if (comment) {
    //             fetch(`/blog/comment/${blogId}`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json'
    //                 },
    //                 body: JSON.stringify({ content: comment })
    //             })
    //                 .then(response => response.json())
    //                 .then(data => {
    //                     alert('Comment added!');
    //                 });
    //         }
    //     });
    // });

    // Follow button functionality
    document.querySelectorAll('.follow-button').forEach(button => {
        button.addEventListener('click', async (event) => {
            const blogId = event.target.closest('.blog-post').getAttribute('data-id');
            const response = await fetch(`/blog/follow/${blogId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: 'your-user-id' }) // Replace with actual logged-in user ID
            });
            const data = await response.json();
            if (response.ok) {
                event.target.innerHTML = `<i class="fa-solid fa-user-plus"></i> Follow (${data.followers})`;
            }
        });
    });
});



window.onscroll = function () {
    var navbar = document.querySelector('.navbar');

    if (window.scrollY > 40) {
        // Change background color when scrolling
        navbar.style.backgroundColor = "#e9ecef"; // Dark background, adjust the color as needed
    } else {
        // Revert back to the transparent background at the top
        navbar.style.backgroundColor = "transparent";
    }
};

document.getElementById('follow-btn').addEventListener('click', function () {
    const button = this;
    const isFollowing = button.getAttribute('data-following') === 'true';
    const postId = '<%= post._id %>'; // Post ID where the author to follow/unfollow

    // Send request to follow/unfollow the user
    fetch(`/users/follow/${postId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <%= token %>' // Ensure you pass the user token if required
        },
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Followed successfully') {
            button.textContent = 'Unfollow';
            button.setAttribute('data-following', 'true');
        } else if (data.message === 'Unfollowed successfully') {
            button.textContent = 'Follow';
            button.setAttribute('data-following', 'false');
        }
        
        // Update the follower count
        document.getElementById('follower-count').textContent = data.followers;
    })
    .catch(err => {
        console.error('Error:', err);
    });
});
