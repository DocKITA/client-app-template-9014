const express = require("express");
const router = express.Router();
const cors = require("cors");
const dotenv = require("dotenv").config();
const crypto = require("crypto");
const request = require("request");

// Allow router to use these library
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const getManagementToken = () => {
    console.log("Retrieving Token from Auth0");
    return new Promise((resolve, reject) => {
        request(
            {
                method: "POST",
                url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({
                    client_id: process.env.AUTH0_CLIENT_ID,
                    client_secret: process.env.AUTH0_CLIENT_SECRET,
                    audience: `https://${process.env.AUTH0_DOMAIN.toString()}/api/v2/`,
                    grant_type: "client_credentials",
                }),
            },
            function (err, res, body) {
                if (err) {
                    reject(err);
                    return;
                }
                const token = JSON.parse(body);
                // console.log("Token: ", token);
                resolve(token);
            }
        );
    });
};

router.get("/get-management-token", async (req, res) => {
    try {
        const managementToken = await getManagementToken();
        return res.json(managementToken);
    } catch (e) {
        console.error(e.message);
        res.status(500).json("Server Error");
    }
});

router.get("/get-user/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const managementToken = await getManagementToken();
        // console.log("Management Token: ", managementToken.access_token);
        // console.log("ID: ", id);
        await fetch(
            `https://${process.env.AUTH0_DOMAIN.toString()}/api/v2/users/${id}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${managementToken.access_token}`,
                },
                redirect: "follow",
            }
        )
            .then((res) => res.json())
            .then((data) => {
                return res.json(data);
            })
            .catch((err) => {
                console.error("Error: ", err);
            });
    } catch (e) {
        console.error(e.message);
        res.status(500).json("Server Error");
    }
});

router.delete("/delete-user/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const managementToken = await getManagementToken();

        // console.log("Management Token: ", managementToken.access_token);
        // console.log("ID: ", id);

        fetch(`https://dockita.us.auth0.com/api/v2/users/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${managementToken.access_token}`,
            },
            redirect: "follow",
        })
            .then((res) => res.text())
            .then((data) => console.log("Account Deleted"))
            .catch((err) => {
                console.error("Error: ", err);
            });

        return res.json("Account Deleted");
    } catch (e) {
        console.error(e.message);
        res.status(500).json("Server Error");
    }
});

// For connection testing purpose, PLEASE DO NOT REMOVE
router.get("/", async (req, res) => {
    try {
        res.json("Auth");
    } catch (err) {
        console.error(err.message);
        res.status(500).json("Server Error");
    }
});

router.patch("/update-profile/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const managementToken = await getManagementToken();

        // Data to update (name, nickname, picture, birthday, and gender)
        const { name, nickname, picture, birthday, gender } = req.body;
        console.log("Name: ", name);
        console.log("Nickname: ", nickname);
        console.log("Picture: ", picture);
        console.log("Birthday: ", birthday);
        console.log("Gender: ", gender);

        // Create a JSON object with the fields you want to update
        const updateData = {
            name,
            nickname,
            picture,
            user_metadata: {
                // This is where you can include additional user data
                birthday,
                gender,
            },
        };

        // Make a PATCH request to update the user profile
        fetch(
            `https://${process.env.AUTH0_DOMAIN.toString()}/api/v2/users/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${managementToken.access_token}`,
                },
                body: JSON.stringify(updateData),
            }
        )
            .then((response) => response.json())
            .then((updatedUser) => {
                // Return the updated user data as a response
                res.json(updatedUser);
            })
            .catch((error) => {
                console.error("Error:", error);
                res.status(500).json("Profile update failed");
            });
    } catch (e) {
        console.error(e.message);
        res.status(500).json("Server Error");
    }
});

router.get("/get-user-by-nickname/:nickname", async (req, res) => {
    try {
        const { nickname } = req.params;
        const managementToken = await getManagementToken();
        console.log("Nickname: ", nickname);

        // Search for the user based on the nickname using the Auth0 Management API
        fetch(
            `https://${process.env.AUTH0_DOMAIN.toString()}/api/v2/users?q=nickname:${nickname}`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${managementToken.access_token}`,
                },
            }
        )
            .then((response) => response.json())
            .then((users) => {
                // Check if users were found
                if (users && users.length > 0) {
                    // Render the user's profile
                    const userProfile = users[0]; // Assuming the first user found is the one we want
                    res.json(userProfile);
                } else {
                    // User not found
                    res.status(404).json("User not found");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                res.status(500).json("Error searching for the user");
            });
    } catch (e) {
        console.error(e.message);
        res.status(500).json("Server Error");
    }
});

router.get("/get-all-user-nicknames", async (req, res) => {
    try {
        const managementToken = await getManagementToken();
        const currentUserSub = req.query.currentUserSub; // Get the currentUserSub from the query parameter

        if (!currentUserSub) {
            return res.status(400).json("currentUserSub is required");
        }

        // Fetch all user data from Auth0
        fetch(`https://${process.env.AUTH0_DOMAIN.toString()}/api/v2/users`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${managementToken.access_token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `Request to Auth0 failed with status: ${response.status}`
                    );
                }
                return response.json();
            })
            .then((users) => {
                // Filter out the current user's data
                const allUserData = users
                    .filter((user) => user.user_id !== currentUserSub) // Exclude the current user
                    .map((user) => ({
                        nickname: user.nickname,
                        created_at: user.created_at,
                    }));

                res.json(allUserData);
            })
            .catch((error) => {
                console.error("Error fetching user data:", error);
                res.status(500).json("Error fetching user data");
            });
    } catch (e) {
        console.error(e.message);
        res.status(500).json("Server Error");
    }
});

module.exports = router;
