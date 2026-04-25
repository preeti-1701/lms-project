import React from 'react';
import { Link } from 'react-router-dom';

function Header() {

    return (

        <header style={{
            background: '#ffffff',
            padding: '18px 40px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>

            <h2>SecureLearn LMS</h2>

            <nav>
                <Link to='/' style={{ marginRight: '20px' }}> Home </Link>
                <Link to='/login' style={{ marginRight: '20px' }}> Login </Link>
                <Link to='/about'> About </Link>
            </nav>

        </header>

    );

}

export default Header;