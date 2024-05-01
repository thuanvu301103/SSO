const logout = (req, res, next) => {
    // const redirectURL = `https://${req.headers.host}`
    // console.log(redirectURL, req.secure, req.headers.host)
    if (req.session.user !== null && req.session.user !== undefined) {
        const sessionToken = req.session.user.sessiontoken
        req.session.destroy()
        return res.redirect(
            `http://localhost:3000/cas/login/cas/logout?sessionToken=${sessionToken}&serviceURL=https://${req.headers.host}`
        )
    }
    next()
}

module.exports = logout