const newErr = (status, message) => {
    return {
        s: status,
        m: message
    }
};
const handleError = (err, req, res, next) => {
    res.status(err.s).send(err.m)
};

module.exports = {
    handleError,
    newErr
};

