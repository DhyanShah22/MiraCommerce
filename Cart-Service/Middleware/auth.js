const jwt = require('jsonwebtoken');
const logger = require('../Logger/logger');

const authenticate = (req, res, next) => {
    const token = req.header('x-auth-token');

    if(!token) {
        return res.status(401).send({msg: 'Authorization denied!'});
        }

    if (!token) {
        return res.status(401).json({ message: 'Invalid token format' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.user = decoded; // Attach decoded user info to req object
        next();
        logger.info('Authentication success...')
    } catch (error) {
        res.status(401).json({ message: 'Invalid token', error });
    }
};

const authorize = (roles) => (req, res, next) => {
    console.log('User role:', req.user.Role);
    logger.info(req.user.Role)
    console.log('Allowed roles:', roles);

    if (!roles.includes(req.user.Role)) {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

module.exports = { authenticate, authorize };
