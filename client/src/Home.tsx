import React from 'react'
import { User } from '@auth0/auth0-spa-js'

interface UserProps {
    isAuthenticated: boolean;
    user: User;
}

const Home = (userProps: UserProps) => {
    const { isAuthenticated, user } = userProps;
    
    return (
        <div>Home</div>
    )
}

export default Home