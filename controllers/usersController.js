const { db, dbQuery } = require('../config/database');
const Crypto = require('crypto'); // untuk enskripsi/hashing password
const { hashPassword, createToken } = require('../config/encrip');
const { transporter } = require('../config/nodemailer');
module.exports = {
    getData: (req, res, next) => {
        db.query('Select username, email, role, status from users;', (err, results) => {
            if (err) {
                res.status(500).send(err)
            }
            res.status(200).send(results)
        })
    },
    register: async (req, res) => {
        try {
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
            let checkmail = await dbQuery(getSql)
            if (checkmail.length > 0) {
                res.status(400).send({
                    success: false,
                    message: "Email Exist ⚠️",
                    error: ""
                })
            } else {
                let insertUser = await dbQuery(insertSQL)
                if (insertUser.insertId) {
                    // get data user berdasarkan insertId
                    let getUser = await dbQuery(`Select * from users where iduser=${insertUser.insertId};`)
                    let { iduser, username, email, role, status } = getUser[0]
                    let token = createToken({ iduser, username, email, role, status })
                    // mengirimkan email yang berisi token untuk login
                    await transporter.sendMail({
                        from: 'Admin Commerce',
                        to: 'zakkirizqurobbi02@gmail.com',
                        subject: 'Confirm Registration',
                        html: `<div>
                        <h3>Klik link dibawah ini untuk verifikasi akun anda</h3>
                        <a href='http://localhost:3000/verification/${token}'>Klik Disini</a>
                        </div>`
                    })
                    res.status(200).send({
                        success: true,
                        message: 'Register Success ✅',
                        error: ''
                    })
                }
            }

        } catch (error) {
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }



        // db.query(getSql, (errGet, resultsGet) => {
        //     if (errGet) {
        //         res.status(500).send({
        //             success: false,
        //             message: "Failed ❌",
        //             error: errGet
        //         })
        //     };

        //     if (resultsGet.length > 0) {
        //         res.status(400).send({
        //             success: false,
        //             message: "Email Exist ⚠️",
        //             error: ""
        //         })
        //     } else {
        //         db.query(insertSQL, (err, results) => {
        //             if (err) {
        //                 res.status(500).send({
        //                     success: false,
        //                     message: "Failed ❌",
        //                     error: err
        //                 })
        //             }
        //             res.status(200).send({
        //                 success: true,
        //                 message: "Register Success ✅",
        //                 error: ""
        //             })
        //         })
        //     }

        // })

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
    },
    verification: async (req, res) => {
        try {
            let { iduser } = req.dataUser
            if(iduser){
                let updateStatus = `UPDATE commerce.users SET status = 'Verified' WHERE iduser = ${db.escape(iduser)}`
                await dbQuery(updateStatus)
                let verifyScript = `Select * from users WHERE iduser=${db.escape(iduser)};`
                let verify = await dbQuery(verifyScript)
                if (verify.length > 0) {
                    let { iduser, username, email, password, role, status } = verify[0];
                    let token = createToken({ iduser, username, email, role, status })
                    res.status(200).send({
                        success: true,
                        message: "Login Success ✅",
                        dataVerify: { username, email, role, status, token },
                        err: ''
                    })
                }

            }else{
                res.status(401).send({
                    success: false,
                    message: "Verify Failed ❌",
                    dataLogin: {},
                    err: ''
                }) 
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }


    }
    // verification:  (req, res) => {
    //         let { iduser } = req.dataUser
    //         let verifyScript = `Select * from users WHERE iduser=${db.escape(iduser)};`
    //         let verify = await dbQuery(verifyScript)
    //         if (verify.length > 0) {
    //             let 
    //         }
    // }
}