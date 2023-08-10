const jwt = require('jsonwebtoken');

module.exports = {
    verifyToken: (req, res, next) => {
        try {
            let token = req.headers.authorization;
            if (!token) throw { status: false, message: 'Unauthorized request' };
            token = token.split(' ')[1];
    
            let verifiedUser = jwt.verify( token, process.env.KEY_JWT );
            req.user = verifiedUser;
            next();
            
        } catch (err) {
            console.log(err)
            res.status(401).send(err);
        }
    },
    verifyAdmin: (req, res, next) => {
        if (req.user.isAdmin) next();
        else res.status(401).send({
            status: false,
            message: 'Access Denied'
        })
    }
}