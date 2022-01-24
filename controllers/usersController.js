const { db } = require('../config/database');
const Crypto = require('crypto'); // untuk enskripsi/hashing password
const { hashPassword, createToken } = require('../config/encrip')
module.exports = {
    getData: (req, res, next) => {
        db.query('Select username, email, role, status from users;', (err, results) => {
            if (err) {
                res.status(500).send(err)
            }
            res.status(200).send(results)
        })
    },
    register: (req, res) => {
        let { username, password, email } = req.body
        // let hashPassword = Crypto.createHmac('sha256', 'budi').update(password).digest('hex')
        console.table({
            before: password,
            after: hashPassword
        });
        let getSql = `Select * from users WHERE email=${db.escape(email)}`
        let insertSQL =
        `Insert into users (username,email,password) values 
        (${db.escape(username)},${db.escape(email)},${db.escape(hashPassword(password))});`


        db.query(getSql, (errGet, resultsGet) => {
            if (errGet) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: errGet
                })
            };

            if (resultsGet.length > 0) {
                res.status(400).send({
                    success: false,
                    message: "Email Exist ⚠️",
                    error: ""
                })
            } else {
                db.query(insertSQL, (err, results) => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            message: "Failed ❌",
                            error: err
                        })
                    }
                    res.status(200).send({
                        success: true,
                        message: "Register Success ✅",
                        error: ""
                    })
                })
            }

        })

    },
    login: (req, res) => {
        let { email, password } = req.body
        // let hashPassword = Crypto.createHmac('sha256', 'budi').update(password).digest('hex');
        let loginScript = `Select * from users WHERE email=${db.escape(email)} AND password=${db.escape(hashPassword(password))};`

        db.query(loginScript, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: err
                })
            };
            if (results.length > 0) {
                let { iduser, username, email, password, role, status } = results[0];
                let token = createToken({ iduser, username, email, role, status })
                res.status(200).send({
                    success: true,
                    message: "Login Success ✅",
                    dataLogin: { username, email, role, status, token },
                    err: ''
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "Login Failed ❌",
                    dataLogin: {},
                    err: ''
                })
            }
        })





        // db.query(`Select * from users WHERE email=${db.escape(email)} and password=${db.escape(password)}`, (err, results) => {
        //     if (err) {
        //         res.status(500).send(err)
        //     }
        //     res.status(200).send(results)
        // })

    },
    keepLogin: (req, res) => {
        let { iduser } = req.dataUser
        console.log(req.dataUser)
        let keepLoginScript = `Select * from users WHERE iduser=${db.escape(iduser)};`
        db.query(keepLoginScript, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: err
                })
            };
            if (results.length > 0) {
                let { iduser, username, email, password, role, status } = results[0];
                let token = createToken({ iduser, username, email, role, status })
                res.status(200).send({
                    success: true,
                    message: "Login Success ✅",
                    dataLogin: { username, email, role, status, token },
                    err: ''
                })
            } else {
                res.status(401).send({
                    success: false,
                    message: "Login Failed ❌",
                    dataLogin: {},
                    err: ''
                })
            }
        })
    }
}