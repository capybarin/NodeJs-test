const jwt = require('jsonwebtoken');
const pg = require('pg');

const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};

let pool = new pg.Pool(dbConfig);

function isEmailValid(email) {
    let emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!email)
        return false;

    if(email.length>254)
        return false;

    let valid = emailRegex.test(email);
    if(!valid)
        return false;

    let parts = email.split("@");
    if(parts[0].length>64)
        return false;

    let domainParts = parts[1].split(".");
    if(domainParts.some(function(part) { return part.length>63; }))
        return false;

    return true;
}


const signupUser = (request, response) => {
    const { email, password } = request.body;
    if (!email) return response.status(422).json({message: 'The email input property is missing.'});
    if (!password) return response.status(422).json({message: 'The password input property is missing.'});

    if (!isEmailValid(email)) {return response.status(422).json({message: 'The email is invalid.'});}

    pool.query('INSERT INTO users (email, password) VALUES ($1, $2)', [email, password], (error, results) => {
        if (error) {
            return response.status(500).json({message: error.detail});
        }
        return response.status(201).json({message: 'Registered.'});
    })
};

const loginUser = (request, response) => {
    const { email, password } = request.body;

    if (!email) return response.status(422).json({message: 'The email input property is missing.'});
    if (!password) return response.status(422).json({message: 'The password input property is missing.'});

    pool.query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password], (error, results) => {
        if (error) {
            return response.status(500).json({message: error.detail});
        }

        if (Array.isArray(results.rows) && results.rows.length === 0) {
            return response.status(403).json({message: 'User does no exist. Please check your email and/or password.'});
        }

        return response.status(200).json({
            token: jwt.sign({ userData: results.rows[0] }, process.env.JWT_SECRET),
        })
    })
};

const logoutUser = (request, response) => {
    const { token } = request.body

    if (!token) return response.status(422).json({message: 'The JWT is missing.'});

    //JWT token based auth cannot be that simply logged out. The idea is to put JWT into a DB to track disabled ones.
    pool.query('INSERT INTO expired_tokens (token) VALUES ($1)', [token], (error, results) => {
        if (error) {
            return response.status(500).json({message: error.detail});
        }
        return response.status(200).json({message: 'Logged out.'});
    })
};

module.exports = {
    signupUser,
    loginUser,
    logoutUser,
};