const jwt = require('jsonwebtoken');
const JWT_SECRET = "Speci@lSecr5t";

const authUser = (req, res, next) => {
    const token = req.header('auth-token');
    if(!token){
        return res.status(401).send({error: "Please login first"});
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({error: "Please login first"});
    }
}

module.exports = authUser;