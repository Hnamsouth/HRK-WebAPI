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
    database: "Eproject",
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
app.get("/checkUer", async(req, res) => {
    let [rows, fields] = await cnnn.promise().query('select * from UserRegister')
    res.status(200).json({ data: rows })
})
app.post("/createUser", async(req, res) => {

    let { FirstName, LastName, Email, Password } = req.query
        // FirstName,LastName,Email,Password
    console.log(FirstName, LastName, Email, Password)
    if (!FirstName || !LastName || !Email || !Password) {
        res.status(200).json({ mess: "Miss required params" })
    }
    let [rows, fields] = await cnnn.promise().query('insert into UserRegister values (?,?,?,?)', [FirstName, LastName, Email, Password])
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