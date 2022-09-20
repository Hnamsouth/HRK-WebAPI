// import thư viện express cú pháp cũ
// express Express :giúp làm  nhanh,  đơn giản hóa  , tối giản cho Node.js
//const express = require('express')
// cú pháp mới
import express from 'express';
import cors from 'cors'

import nodemailer from 'nodemailer';

import 'dotenv/config' // 

// import configViewengine from './config/viewEngine';
// import createroute from './route/route'
// import createRoute from './route/api.js';
// import conDA from './config/conDoAn';
// import routeUSER from './route/routDOAN';

import bodyParser from 'body-parser';
import mysql from 'mysql2'
// const cnnn = mysql.createPool({
//         host: "pokabi.tech", //  123.16.16.117  - api.pokabi.tech -  pokabi.tech
//         user: "admin_edit",
//         password: "adminedit",
//         database: "eproject",
//         waitForConnections: true,
//         connectionLimit: 10,
//         queueLimit: 0
//             // port: 3306,
//             // socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
//     })
const cnnn = mysql.createPool({
    host: "127.0.0.1", //  123.16.16.117  - api.pokabi.tech -  pokabi.tech
    user: "root",
    password: "",
    database: "eproject",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
        // port: 3306,
        // socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
})


const app = express()
const port = process.env.PORT;

// giúp chuyền data từ client lên db
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// cho phep tat ca cac client co the truy cap khi tao api
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
// configure the Express middleware to accept CORS requests and parse request body into JSON
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());

app.get("/", async(req, res) => {
    let [rows, fields] = await cnnn.promise().query('select * from register')

    res.status(200).json({ data: rows })
})

app.post("/checkUer", async(req, res) => {
    console.log(req.body)
    let { emailorphone, password } = req.body
    if (!emailorphone || !password) {
        res.status(200).json({ mess: 'Miss required params', status: 404 })
    } else {
        let [rows, fields] = await cnnn.promise().query('select count(*) from register where emailorphone like ? and password like ? ', [emailorphone, password])
        if (rows == 1) {
            res.status(200).json({ mess: 'User found', status: true, data: rows })
        } else {
            res.status(200).json({ mess: 'User not found', status: false, data: rows })
        }
    }

})
app.post("/createUser", async(req, res) => {
        console.log(req.body)

        let { firstname, lastname, emailorphone, password } = req.body
            // FirstName,LastName,Email,Password
        if (firstname == '' || lastname == '' || emailorphone == '' || password == '') {
            res.status(200).json({ mess: "Miss required params", params: req.body })
        } else {
            // console.log(firstname, lastname, emailorphone, password)
            await cnnn.promise().query('INSERT INTO `register` (`firstname`, `lastname`, `emailorphone`, `password`) VALUES (?,?,?,?)', [firstname, lastname, emailorphone, password])
            res.status(200).json({ mess: "user created", data: req.body })
        }
    })
    // define a sendmail endpoint, which will send emails and response with the corresponding status
app.get("/sendmail", (req, res) => {
    // user: "namhvth2204008@fpt.edu.vn",
    //         pass: "AFMhn17397"
    nodemailer.createTestAccount((err, account) => {
        if (err) {
            console.error('Failed to create a testing account. ' + err.message);
            return process.exit(1);
        }

        console.log('Credentials obtained, sending message...');

        // Create a SMTP transporter object
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "namhvth2204008@fpt.edu.vn",
                pass: "AFMhn17397"
            }
        });

        // Message object
        let message = {
            from: 'namhvth2204008@fpt.edu.vn',
            to: 'hnam17397@gmail.com',
            subject: 'Nodemailer is unicode friendly ✔',
            text: 'Hello to myself!',
            html: `
            <body style="background-color:rgb(248, 248, 248) ;">
            <div >
                <div  style="width:60%; margin:15px auto;background-color:white;box-shadow:3px 2px 5px rgb(210, 210, 210); padding:20px 20px">
                    <div  style="">
                        <h2>Welcome to Keansburges</h2>
                        <img src="https://keansburgamusementpark.com/wp-content/uploads/2015/02/kap_logo.png" alt="" width="100vw">
                        <hr>
                        <p>Thank you for signing up as a member of keansburge. Wish you have a pleasant journey in Keansburge. Please Click Verify to Login</p>
                        <a href="" style="color:white;text-decoration:none;font-size:18px;background-color: rgb(0, 111, 247);border:none;padding:3px 7px;border-radius:5px" >Verify</a>
                        <br><br><br>
                        <a href="https://keansburgamusementpark.com/">https://keansburgamusementpark.com/</a>
                    </div>
                </div>
            </div>
        </body>`,

        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }

            res.send('Message sent success: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });

});
//    Add the following lines of code to set configuration of Nodemailer:

//   Define the options of your email like to/from-headers, subject line, and body text:




// configViewengine(app);
// // declare route WEB
// createroute(app);
// // declare route API
// createRoute(app);
// //  declare route API Eproject
// routeUSER(app);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})