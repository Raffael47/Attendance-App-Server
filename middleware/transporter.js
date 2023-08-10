const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "raffaelwdj@gmail.com",
        pass: 'nryt fzts lquv qgyx'
        // user: process.env.TRANSPORTER_EMAIL,
        // pass: process.env.TRANSPORTER_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
})

module.exports = transporter