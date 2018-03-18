const {User} = require('./../models/user');
const {newErr} = require('./../middleware/handleError');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('x-auth');
        const user = await User.findByToken(token);
        if (!user) {
            throw new Error()
        }
        req.user = user;
        req.token = token;
        next();
    } catch (err) {
        next(newErr(401, 'invalid token'))
    }
};

module.exports = {
    authenticate
};