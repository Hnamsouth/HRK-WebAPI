// import thư viện express cú pháp cũ
// express Express :giúp làm  nhanh,  đơn giản hóa  , tối giản cho Node.js
//const express = require('express')
// cú pháp mới
import express from 'express';
import 'dotenv/config' // 

// import configViewengine from './config/viewEngine';
// import createroute from './route/route'
// import createRoute from './route/api.js';
// import conDA from './config/conDoAn';
// import routeUSER from './route/routDOAN';

import bodyParser from 'body-parser';
import mysql from 'mysql2'
const cnnn = mysql.createPool({
        host: "pokabi.tech", //  123.16.16.117  - api.pokabi.tech -  pokabi.tech
        user: "admin_edit",
        password: "adminedit",
        database: "eproject",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
            // port: 3306,
            // socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
    })
    // const cnnn = mysql.createPool({
    //     host: "127.0.0.1", //  123.16.16.117  - api.pokabi.tech -  pokabi.tech
    //     user: "root",
    //     password: "",
    //     database: "eproject",
    //     port: 3306,
    //     waitForConnections: true,
    //     connectionLimit: 10,
    //     queueLimit: 0
    //         // port: 3306,
    //         // socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock"
    // })


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