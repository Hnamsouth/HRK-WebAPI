// import thư viện express cú pháp cũ
// express Express :giúp làm  nhanh,  đơn giản hóa  , tối giản cho Node.js
//const express = require('express')
// cú pháp mới
import express from 'express';
import cors from 'cors'

import nodemailer from 'nodemailer';
import { Buffer } from 'node:buffer';

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
    host: "139.180.186.20", //  123.16.16.117  - api.pokabi.tech -  pokabi.tech
    user: "t2204m",
    password: "t2204m123",
    database: "t2204m",
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
    let [rows, fields] = await cnnn.promise().query('select * from nhom5_user_register');
    console.log(rows)
    res.status(200).json({ data: rows })
})

app.post("/checkverify", async(req, res) => {
    let { emailorphone } = req.body;
    let [rows, fields] = await cnnn.promise().query('select sttregister from nhom5_user_register where emailorphone like ?', [emailorphone]);
    if (rows[0].sttregister === 1) {
        res.status(200).json({ mess: "user register success", data: rows[0].sttregister })
    } else {
        res.status(200).json({ mess: "user not registed", data: rows[0].sttregister })
    }
})
app.post("/checkUerlogin", async(req, res) => {
    // console.log(req.body)
    let { emailorphone, password } = req.body
    if (!emailorphone || !password) {
        res.status(200).json({ mess: 'Miss required params', status: 404 })
    } else {
        let [rows, fields] = await cnnn.promise().query('select count(emailorphone) as user , sttregister from nhom5_user_register where emailorphone like ? and password like ? ', [emailorphone, password])
        if (rows[0].user == 1 && rows[0].sttregister == 1) {
            res.status(200).json({ mess: 'User found', status: 101, data: rows })
        } else if (rows[0].user == 1 && rows[0].sttregister == 0) {
            res.status(200).json({ mess: 'User not verify', status: 202, data: rows })
        } else {
            res.status(200).json({ mess: 'User not found', status: 303, data: rows })
        }
    }
})

app.post("/createUser", async(req, res) => {
    // console.log(req.body)
    let { firstname, lastname, emailorphone, password, cverify } = req.body
    console.log(req.body)
        // FirstName,LastName,Email,Password
    if (firstname == '' || lastname == '' || emailorphone == '' || password == '') {
        res.status(200).json({ mess: "Miss required params", params: req.body })
    } else {
        let [rows, fields] = await cnnn.promise().query('select * from nhom5_user_register where emailorphone like ?', [emailorphone]);
        // let [rows2, fields2] = await cnnn.promise().query('select * from register')
        if (rows.length == 1 && rows[0].sttregister == 0) {
            // neu user =1 va sttrgt = 0 (co trong db nhung chua verify)thì gửi lại mess tơi email đó
            //  update cverify
            await cnnn.promise().query('update nhom5_user_register set cverify = ?,firstname= ?, lastname= ?,password=? where emailorphone like ?', [cverify, firstname, lastname, password, emailorphone]);
            // let [rows22, fields] = await cnnn.promise().query('select * from register where emailorphone like ?', [emailorphone]);
            res.status(200).json({ mess: 'User not verify', status: 101 })
                // res.redirect('sendmail')
        } else if (rows.length == 0) {
            // nếu user =0 thì push data và sendmail 
            await cnnn.promise().query('INSERT INTO `nhom5_user_register` (`firstname`, `lastname`, `emailorphone`, `password`,`cverify`) VALUES (?,?,?,?,?)', [firstname, lastname, emailorphone, password, cverify])
            res.status(200).json({ mess: " add user compelete", status: 202 })
        } else {
            // neu user =1 va sttrgt = 1 trả về mess: tk đã đc đăng ký
            res.status(200).json({ mess: 'User registed', status: 303 })
        }
    }
})
app.post('/sttrgt', async(req, res) => {
    console.log(req.query)
    res.status(200).json({ mess: 'user sc', checkregister: 200 })
})

app.get('/updateregister', async(req, res) => {
        console.log(req.query)
        let { emailorphone, cverify } = req.query
        if (!emailorphone || !cverify) {
            res.status(200).json({ mess: 'Miss required params', checkregister: 404 })
        } else {
            let [rows, fields] = await cnnn.promise().query('select count(*) as user from nhom5_user_register where emailorphone like ? and cverify = ? ', [emailorphone, cverify])
            if (rows[0].user == 1) {
                await cnnn.promise().query('update nhom5_user_register set sttregister = 1 where emailorphone = ?', [emailorphone])
                res.redirect(`https://eproject-team.web.app/login`)
                    // res.status(200).json({ mess: 'User registed success', checkregister: 303 })
            } else {
                res.status(200).json({
                    mess: 'User not found',
                    checkregister: 202
                })
            }
        }
    })
    // define a sendmail endpoint, which will send emails and response with the corresponding status
app.post("/sendmail", async(req, res) => {
    // console.log(req.body)
    let { User, Stt } = req.body;
    let check = await cnnn.promise().query(`select sttregister from nhom5_user_register where emailorphone like '${User}'`)
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
                user: process.env.USER,
                pass: process.env.PASS
            }
        });
        // Message object
        let message = {
            from: process.env.USER,
            to: User,
            subject: 'Nodemailer is unicode friendly ✔',
            text: 'Hello to myself!',
            html: `<table border="0" cellspacing="0" cellpadding="0" style="padding-bottom:20px;max-width:516px;min-width:220px;margin:0 auto;">
            <tbody>
                <tr>
                    <td width="8" style="width:8px"></td>
                    <td>
                        
                        <div style="border-style:solid;border-width:thin;border-color:#dadce0;border-radius:8px;padding:40px 20px" align="center" class="m_4662939741572771938mdv2rw"><img src="https://eproject-team.web.app/assets/svg/logo.svg"
                                width="74" height="24" aria-hidden="true" style="margin-bottom:16px; filter: drop-shadow(0 1px 2px #35181f);" alt="Google" class="CToWUd" data-bit="iit">
                            <div style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;border-bottom:thin solid #dadce0;color:rgba(0,0,0,0.87);line-height:32px;padding-bottom:24px;text-align:center;word-break:break-word">
                                <div style="font-size:24px">Welcome to Keansburger</div>
                                <table align="center" style="margin-top:8px">
                                    <tbody>
                                        <tr style="line-height:normal">
                                            <td align="right" style="padding-right:8px"><img width="20" height="20" style="width:20px;height:20px;vertical-align:sub;border-radius:50%" src="./public/img/iconuser.png" alt="" class="CToWUd" data-bit="iit"></td>
                                            <td><a style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.87);font-size:14px;line-height:20px">${User}</a></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;font-size:14px;color:rgba(0,0,0,0.87);line-height:20px;padding-top:20px;text-align:center">Thank you for signing up as a member of keansburge. Wish you have a pleasant journey in Keansburge. Please Click Verify to Login.
                                <div style="padding-top:32px;text-align:center"><form  method="post">  <a href="https://app-t2204m-eprojet.herokuapp.com/updateregister?emailorphone=${User}&cverify=${Stt}" style="font-family:'Google Sans',Roboto,RobotoDraft,Helvetica,Arial,sans-serif;line-height:16px;color:#ffffff;font-weight:400;text-decoration:none;font-size:14px;display:inline-block;padding:10px 24px;background-color:#4184f3;border-radius:5px;min-width:90px"
                                        target="_blank" data-saferedirecturl="" name="test" type="submit"> Verify - ${Stt} </a></form></div>
                            </div>
                            <div style="padding-top:20px;font-size:12px;line-height:16px;color:#5f6368;letter-spacing:0.3px;text-align:center">You can also watch the activity at<br><a style="color:rgba(0,0,0,0.87);text-decoration:inherit">https://eproject-team.web.app/</a></div>
                        </div>
                        <div style="text-align:left">
                            <div style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:12px;text-align:center">
                                <div></div>
                                <div style="direction:ltr">©2022 Keansburg Amusement Park <a class="m_4662939741572771938afal" style="font-family:Roboto-Regular,Helvetica,Arial,sans-serif;color:rgba(0,0,0,0.54);font-size:11px;line-height:18px;padding-top:12px;text-align:center">Keansburg, New Jersey, USA</a></div>
                            </div>
                        </div>
                    </td>
                    <td width="8" style="width:8px"></td>
                </tr>
            </tbody>
        </table>`,

        };

        transporter.sendMail(message, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return process.exit(1);
            }

            console.log(info.messageId);
            // 'Message sent success: %s', 
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