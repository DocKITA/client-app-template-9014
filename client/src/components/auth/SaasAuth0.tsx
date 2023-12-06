import React from 'react'
import{ useAuth0 } from '@auth0/auth0-react'
import { Button } from 'react-bootstrap';

const SaaSAuth0 = () => {
    const { loginWithRedirect } = useAuth0();
    return (
        <Button variant="outline-light" onClick={() => loginWithRedirect()}>
            Sign Up
        </Button>
    )
}

export default SaaSAuth0