import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
    Row,
    Col,
    Form,
    Button,
    Card,
    Container,
    Image,
    Alert,
    Modal,
} from "react-bootstrap";
import { Routes, Route, useParams, useNavigate } from "react-router-dom";
import { User } from "@auth0/auth0-spa-js";
import "../../style/App.css";
import { firebaseStore } from "../Util/FirebaseConfig";


const Main = () => {
    const { getIdTokenClaims, user, isLoading, logout } = useAuth0();
    const { profile_id } = useParams<{ profile_id: string }>();
    const [showDeleteAccountModal, setShowDeleteAccountModal] =
        useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [profileEmail, setProfileEmail] = useState("");
    const isCurrentUserProfile = user && user.nickname === profile_id;
    const navigate = useNavigate();
    const today = new Date().toISOString().split("T")[0];
    const [birthdayError, setBirthdayError] = useState("");
    const [genderError, setGenderError] = useState<string>("");
    const [nameError, setNameError] = useState<string>("");
    const [usernameError, setUsernameError] = useState("");
    const [showUsernameRequiredMessage, setShowUsernameRequiredMessage] =
        useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [allUserNicknames, setAllUserNicknames] = useState<string[]>([]);
    const [matchingUser, setMatchingUser] = useState(null);

    // Initialize form data and initial user data states
    const [formData, setFormData] = useState<{
        name: string;
        nickname: string;
        picture: string;
        birthday: string;
        gender: string | undefined;
    }>({
        name: user?.name || "",
        nickname: user?.nickname || "",
        picture: user?.picture || "",
        birthday: "",
        gender: "",
    });

    const [initialUserData, setInitialUserData] = useState<{
        name: string;
        nickname: string;
        picture: string;
        birthday: string;
        gender: string | undefined;
    }>({
        name: user?.name || "",
        nickname: user?.nickname || "",
        picture: user?.picture || "",
        birthday: "",
        gender: "",
    });

    const [unsavedChanges, setUnsavedChanges] = useState(false);

    // Check if the user is authenticated with Google OAuth2
    const isGoogleOAuth2User =
        user && user.sub && user.sub.includes("google-oauth2");

    // Function to save user profile changes
    const handleSaveProfile = async () => {
        const selectedBirthday = new Date(formData.birthday);
        setShowUsernameRequiredMessage(false);

        // Validate name
        if (!formData.name.trim()) {
            setNameError("Name is required.");
            setUsernameError("");
            setGenderError("");
            setBirthdayError("");
            return;
        } else {
            setNameError("");
        }

        // Validate username
        if (!formData.nickname.trim()) {
            setUsernameError("Username is required.");
            setNameError("");
            setGenderError("");
            setBirthdayError("");
            return;
        } else if (
            allUserNicknames.some(
                (user) => (user as any).nickname === formData.nickname
            )
        ) {
            setUsernameError(
                "Username already exists. Please choose a different one."
            );
            setNameError("");
            setGenderError("");
            setBirthdayError("");
            return;
        } else {
            setUsernameError("");
        }

        // Validate birthday
        if (!formData.birthday) {
            setBirthdayError("Birthday is required.");
            setGenderError("");
            setNameError("");
            setUsernameError("");
            return;
        }

        if (isNaN(selectedBirthday.getTime())) {
            setBirthdayError("Invalid birthday date.");
            setGenderError("");
            setNameError("");
            setUsernameError("");
            return;
        }

        if (selectedBirthday > new Date()) {
            setBirthdayError("Birthday cannot be in the future.");
            setGenderError("");
            setNameError("");
            setUsernameError("");
            return;
        } else {
            setBirthdayError("");
        }

        // Validate gender
        if (!formData.gender) {
            setGenderError("Gender is required.");
            setBirthdayError("");
            setNameError("");
            setUsernameError("");
            return;
        } else {
            setGenderError("");
        }

        // Handle profile updates differently for Google OAuth2 users
        if (isGoogleOAuth2User) {
            // For Google OAuth2 users, only save birthday and gender
            fetch(`/api/auth/update-profile/${user.sub}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nickname: formData.nickname,
                    birthday: formData.birthday,
                    gender: formData.gender,
                }),
            })
                .then((response) => response.json())
                .then((updatedUser) => {
                    console.log(
                        "Profile updated successfully for Google OAuth2 user:",
                        updatedUser
                    );

                    // Update the formData state with the latest changes
                    setFormData({
                        ...formData,
                        birthday: updatedUser.birthday,
                        gender: updatedUser.gender,
                        nickname: updatedUser.nickname,
                    });

                    // Show the success modal after profile update
                    setShowSuccessModal(true);
                    navigate(`/${updatedUser.nickname}`);
                })
                .catch((error) => {
                    console.error(
                        "Profile update failed for Google OAuth2 user:",
                        error
                    );
                });
        } else {
            // For normal users, save all profile data
            let profileUrl = user?.picture;
            if (formData.picture) {
                const dataurl = formData.picture;
                const filename = "profilePic.png";
                const file = dataURLtoFile(dataurl, filename);
                if (file) {
                    profileUrl = (await firebaseStore(
                        file,
                        `profile`
                    )) as string;
                } else {
                    console.error("Data URL to File conversion failed.");
                }
            }

            if (user) {
                fetch(`/api/auth/update-profile/${user.sub}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        nickname: formData.nickname,
                        picture: profileUrl,
                        birthday: formData.birthday,
                        gender: formData.gender,
                    }),
                })
                    .then((response) => response.json())
                    .then((updatedUser) => {
                        console.log(
                            "Profile updated successfully for normal user:",
                            updatedUser
                        );

                        // Update the formData state with the latest changes
                        setFormData({
                            ...formData,
                            name: updatedUser.name,
                            nickname: updatedUser.nickname,
                            picture: updatedUser.picture,
                            birthday: updatedUser.birthday,
                            gender: updatedUser.gender,
                        });

                        // Show the success modal after profile update
                        setShowSuccessModal(true);
                        navigate(`/${updatedUser.nickname}`);
                    })
                    .catch((error) => {
                        console.error(
                            "Profile update failed for normal user:",
                            error
                        );
                    });
            } else {
                console.error(
                    "User object is undefined. Cannot update profile."
                );
            }
        }
    };

    // Handle image change when the user selects a new profile picture
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isGoogleOAuth2User) {
            // Hide profile picture upload for Google OAuth2 users
            return;
        }

        if (e.target && e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target) {
                    const imagePreview = event.target.result as string;
                    setFormData((prevData) => ({
                        ...prevData,
                        picture: imagePreview,
                    }));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    function dataURLtoFile(dataurl: string, filename: string): File | null {
        const arr = dataurl.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);

        if (mimeMatch && mimeMatch[1]) {
            const mime = mimeMatch[1];
            const bstr = atob(arr[arr.length - 1]);
            const u8arr = new Uint8Array(bstr.length);

            for (let i = 0; i < bstr.length; i++) {
                u8arr[i] = bstr.charCodeAt(i);
            }

            return new File([u8arr], filename, { type: mime });
        } else {
            return null; // Return null if MIME type cannot be determined
        }
    }

    const handleDeleteAccount = () => {
        if (user) {
            fetch(`/api/auth/delete-user/${user.sub}`, {
                method: "DELETE",
            })
                .then((res) => res.json())
                .then((data) => console.log(data))
                .then(() => {
                    logout();
                });
        }
    };

    useEffect(() => {
        document.title = "Profile";
        console.log(user);
    }, []);

    // Fetch user data for the given profile ID when the component mounts or profile ID changes
    useEffect(() => {
        if (profile_id) {
            fetch(`/api/auth/get-user-by-nickname/${profile_id}`)
                .then((response) => {
                    if (response.status === 404) {
                        console.error("User not found");
                        setNotFound(true);
                    } else if (response.status === 200) {
                        return response.json();
                    } else {
                        throw new Error("Error fetching user data");
                    }
                })
                .then((data) => {
                    if (data && !data.error) {
                        console.log("User data:", data);

                        setMatchingUser(data);

                        // Update the formData and initialUserData states with user data
                        setFormData({
                            ...formData,
                            name: data.name,
                            nickname: data.nickname,
                            picture: data.picture,
                            birthday: data.user_metadata?.birthday || "",
                            gender: data.user_metadata?.gender || "",
                        });
                        setProfileEmail(data.email);

                        // Save the initial user data when the component mounts
                        setInitialUserData({
                            name: data.name,
                            nickname: data.nickname,
                            picture: data.picture,
                            birthday: data.user_metadata?.birthday || "",
                            gender: data.user_metadata?.gender || "",
                        });
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                });
        } else {
            console.error("No username parameter found in the URL.");
        }
    }, [profile_id]);

    // Function to check if there are unsaved changes
    const checkUnsavedChanges = () => {
        const formKeys = Object.keys(formData) as (keyof typeof formData)[];
        for (const key of formKeys) {
            if (formData[key] !== initialUserData[key]) {
                setUnsavedChanges(true);
                return;
            }
        }
        setUnsavedChanges(false);
    };

    // Use this effect to check for unsaved changes whenever the form data changes
    useEffect(() => {
        checkUnsavedChanges();
    }, [formData, initialUserData]);

    const handleSearch = () => {
        if (searchQuery) {
            const username = searchQuery; // Get the username from the search query
            const url = `/${username}`; // Construct the URL
            navigate(url); // Navigate to the new URL
        }
    };

    /// useEffect(() => {
    //   // Fetch all user nicknames (excluding the current user) by passing the user's sub to the backend
    //   if (user && user.sub) {
    //     fetch(`/api/auth/get-all-user-nicknames?currentUserSub=${user.sub}`)
    //       .then((response) => response.json())
    //       .then((nicknames) => {
    //         setAllUserNicknames(nicknames);
    //       })
    //       .catch((error) => {
    //         console.error("Error fetching user nicknames:", error);
    //       });
    //   }
    // }, [user]);

    useEffect(() => {
        if (user && user.sub) {
            fetch(`/api/auth/get-all-user-nicknames?currentUserSub=${user.sub}`)
                .then((response) => response.json())
                .then((nicknames) => {
                    console.log("Returned JSON Data:", nicknames);
                    setAllUserNicknames(nicknames);

                    // Check if the user's current nickname exists in the list
                    const userNickname = formData.nickname;
                    const matchingNickname = nicknames.find(
                        (nicknameObj: any) =>
                            nicknameObj.nickname === userNickname
                    );

                    if (matchingNickname) {
                        // Convert the creation date of the nickname to a JavaScript Date object
                        const nicknameCreatedDate = new Date(
                            matchingNickname.created_at
                        );

                        if (matchingUser && (matchingUser as any).created_at) {
                            // Convert the creation date of the user to a JavaScript Date object
                            const userCreatedDate = new Date(
                                (matchingUser as any).created_at
                            );

                            if (
                                userCreatedDate >= nicknameCreatedDate &&
                                isCurrentUserProfile
                            ) {
                                // If userCreatedDate is earlier or equal, clear the username field
                                setFormData({ ...formData, nickname: "" });
                                setShowUsernameRequiredMessage(true);
                            }
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user nicknames:", error);
                });
        }
    }, [matchingUser]);

    return (
        <div>
            {notFound ? (
                <Alert variant="warning" className="text-center">
                    <Alert.Heading>User not found</Alert.Heading>
                    <p>
                        We couldn't find the user you are looking for. Please
                        check the username or try searching for another user.
                    </p>
                </Alert>
            ) : (
                <Row className="justify-content-center">
                    <Col xs={12} md={11}>
                        <Card className="m-auto align-self-center">
                            <Card.Header className="d-flex justify-content-between">
                                <Card.Title>User Profile</Card.Title>
                                <div className="search-bar">
                                    <input
                                        type="text"
                                        placeholder="Search user by username"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                    <button onClick={handleSearch}>
                                        Search
                                    </button>
                                </div>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col
                                        md={2}
                                        xs={12}
                                        className="d-flex flex-column align-items-center"
                                    >
                                        <Image
                                            className="mx-5"
                                            src={
                                                formData.picture ||
                                                (user && user.picture) ||
                                                "default-profile-image-url.png"
                                            }
                                            alt="Profile Picture"
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                            }}
                                            roundedCircle
                                        />
                                        <Col
                                            className="my-3 d-flex justify-content-end"
                                            md={7.5}
                                        >
                                            {!isGoogleOAuth2User &&
                                                isCurrentUserProfile && (
                                                    <>
                                                        <label
                                                            htmlFor="file-upload"
                                                            className="custom-file-upload ml-2"
                                                        >
                                                            Choose File
                                                        </label>
                                                        <input
                                                            id="file-upload"
                                                            type="file"
                                                            accept="image/*"
                                                            className="d-none"
                                                            onChange={
                                                                handleImageChange
                                                            }
                                                        />
                                                    </>
                                                )}
                                        </Col>
                                    </Col>

                                    <Col md={10} xs={12}>
                                        <div className="d-flex justify-content-center">
                                            <Form className="px-2 w-100">
                                                <Form.Group>
                                                    <Row className="mt-3">
                                                        <Col
                                                            xs={2}
                                                            className="text-right"
                                                        >
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "0.3rem",
                                                                }}
                                                            >
                                                                <strong>
                                                                    Name:
                                                                </strong>
                                                            </div>
                                                        </Col>
                                                        <Col xs={10}>
                                                            {isCurrentUserProfile ? (
                                                                <>
                                                                    <Form.Control
                                                                        className="mt-2"
                                                                        type="text"
                                                                        name="name"
                                                                        value={
                                                                            formData.name
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    name: e
                                                                                        .target
                                                                                        .value,
                                                                                }
                                                                            )
                                                                        }
                                                                        readOnly={
                                                                            isGoogleOAuth2User
                                                                                ? true
                                                                                : !isCurrentUserProfile
                                                                        }
                                                                    />
                                                                    {nameError && (
                                                                        <p className="text-danger">
                                                                            {
                                                                                nameError
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="mt-2">
                                                                    {
                                                                        formData.name
                                                                    }
                                                                </span>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Row className="mt-3">
                                                        <Col
                                                            xs={2}
                                                            className="text-right"
                                                        >
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "0.3rem",
                                                                }}
                                                            >
                                                                <strong>
                                                                    Username:
                                                                </strong>
                                                            </div>
                                                        </Col>
                                                        <Col xs={10}>
                                                            {isCurrentUserProfile ? (
                                                                <>
                                                                    <Form.Control
                                                                        className="mt-2"
                                                                        type="text"
                                                                        name="nickname"
                                                                        value={
                                                                            formData.nickname
                                                                        }
                                                                        onChange={(
                                                                            e
                                                                        ) =>
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    nickname:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            )
                                                                        }
                                                                        readOnly={
                                                                            !isCurrentUserProfile
                                                                        }
                                                                        // readOnly={isGoogleOAuth2User ? true : !isCurrentUserProfile}
                                                                    />
                                                                    {usernameError && (
                                                                        <p className="text-danger">
                                                                            {
                                                                                usernameError
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {showUsernameRequiredMessage && (
                                                                        <div className="text-danger">
                                                                            Please
                                                                            enter
                                                                            a
                                                                            username.
                                                                        </div>
                                                                    )}
                                                                </>
                                                            ) : (
                                                                <span className="mt-2">
                                                                    {
                                                                        formData.nickname
                                                                    }
                                                                </span>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Form.Group>

                                                <Form.Group>
                                                    <Row className="mt-3">
                                                        <Col
                                                            xs={2}
                                                            className="text-right"
                                                        >
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "0.3rem",
                                                                }}
                                                            >
                                                                <strong>
                                                                    Email:
                                                                </strong>
                                                            </div>
                                                        </Col>
                                                        <Col xs={10}>
                                                            {isCurrentUserProfile ? (
                                                                <Form.Control
                                                                    className="mt-2"
                                                                    type="email"
                                                                    name="email"
                                                                    value={
                                                                        user.email
                                                                    }
                                                                    readOnly
                                                                />
                                                            ) : (
                                                                <span className="mt-2">
                                                                    {
                                                                        profileEmail
                                                                    }
                                                                </span>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Row className="mt-3">
                                                        <Col
                                                            xs={2}
                                                            className="text-right"
                                                        >
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "0.3rem",
                                                                }}
                                                            >
                                                                <strong>
                                                                    Birthday:
                                                                </strong>
                                                            </div>
                                                        </Col>
                                                        <Col xs={10}>
                                                            {isCurrentUserProfile ? (
                                                                <Form.Control
                                                                    className="mt-2"
                                                                    type="date"
                                                                    name="birthday"
                                                                    value={
                                                                        formData.birthday
                                                                    }
                                                                    readOnly={
                                                                        !isCurrentUserProfile
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        if (
                                                                            isCurrentUserProfile
                                                                        ) {
                                                                            setFormData(
                                                                                {
                                                                                    ...formData,
                                                                                    birthday:
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                }
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="mt-2">
                                                                    {
                                                                        formData.birthday
                                                                    }
                                                                </span>
                                                            )}
                                                            {birthdayError && (
                                                                <p className="text-danger">
                                                                    {
                                                                        birthdayError
                                                                    }
                                                                </p>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Row className="mt-3">
                                                        <Col
                                                            xs={2}
                                                            className="text-right"
                                                        >
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "0.3rem",
                                                                }}
                                                            >
                                                                <strong>
                                                                    Gender:
                                                                </strong>
                                                            </div>
                                                        </Col>
                                                        <Col xs={10}>
                                                            {isCurrentUserProfile ? (
                                                                <Form.Control
                                                                    className="mt-2"
                                                                    as="select"
                                                                    name="gender"
                                                                    value={
                                                                        formData.gender
                                                                    }
                                                                    onChange={(
                                                                        e
                                                                    ) => {
                                                                        const selectedGender =
                                                                            e
                                                                                .target
                                                                                .value;
                                                                        setFormData(
                                                                            (
                                                                                prevData
                                                                            ) => ({
                                                                                ...prevData,
                                                                                gender: selectedGender,
                                                                            })
                                                                        );
                                                                        setGenderError(
                                                                            ""
                                                                        );
                                                                    }}
                                                                >
                                                                    <option value="">
                                                                        Select
                                                                        Gender
                                                                    </option>
                                                                    <option value="Male">
                                                                        Male
                                                                    </option>
                                                                    <option value="Female">
                                                                        Female
                                                                    </option>
                                                                    <option value="Prefer Not To Say">
                                                                        Prefer not to say
                                                                    </option>
                                                                </Form.Control>
                                                            ) : (
                                                                <span className="mt-2">
                                                                    {formData.gender}
                                                                </span>
                                                            )}
                                                            {genderError && (
                                                                <p className="text-danger">
                                                                    {genderError}
                                                                </p>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                                <Form.Group>
                                                    <Row className="mt-3">
                                                        <Col xs={2} className="text-right"></Col>
                                                        <Col xs={10}>
                                                            {isCurrentUserProfile && (
                                                                <Button
                                                                    className="custom-button"
                                                                    variant="outline-light"
                                                                    style={{
                                                                        backgroundColor: process.env.REACT_APP_APPLICATION_THEME_COLOR,
                                                                        color: "white",
                                                                        width: "100%",
                                                                    }}
                                                                    onClick={handleSaveProfile}
                                                                    disabled={!unsavedChanges}
                                                                >
                                                                    Save
                                                                </Button>
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </Form.Group>
                                            </Form>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                        {isCurrentUserProfile && (
                            <Alert className="mt-4 alert alert-danger">
                                <Alert.Heading className="">
                                    Delete Account
                                </Alert.Heading>
                                <Row>
                                    <Col md={10}>
                                        You will DocKITA account will be removed, and it will no longer have access to your applications
                                    </Col>
                                    <Col>
                                        <Button variant="danger" onClick={() => setShowDeleteAccountModal(true)}>
                                            Delete
                                        </Button>
                                    </Col>
                                </Row>
                            </Alert>
                        )}
                        <Modal show={showDeleteAccountModal} onHide={() => setShowDeleteAccountModal(false)} centered>
                            <Modal.Header closeButton>
                                Delete Account
                            </Modal.Header>
                            <Modal.Body>
                                Are you really sure you want to delete " {formData.nickname}"? This cannot be undone!
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowDeleteAccountModal(false)}>
                                    Cancel
                                </Button>
                                <Button variant="danger" onClick={handleDeleteAccount}>
                                    Yes, Delete It
                                </Button>
                            </Modal.Footer>
                        </Modal>
                    </Col>
                </Row>
            )}
            <Modal show={showSuccessModal} onHide={() => window.location.reload()} centered>
                <Modal.Body>
                    Your profile has been updated successfully.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => window.location.reload()}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const Profile = () => {
    return (
        <Routes>
            <Route path="/" element={<Main />} />
        </Routes>
    );
};

export default Profile;
