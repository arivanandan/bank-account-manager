const mysql = require('mysql')
const http = require('http').createServer()
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('morgan')
const app = express()
const connection = require('express-myconnection')
const session = require('express-session')
const uuid = require('node-uuid')
const MySQLStore = require('express-mysql-session')(session)
const multer = require('multer')
const dotenv = require('dotenv')

const fs = require('fs')
const Guid = require('guid')
const Mustache = require('mustache')
const Request = require('request')
const Querystring = require('querystring')
const path = require('path')
const formidable = require('formidable')

dotenv.load()

const options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  checkExpirationInterval: 60 * 10
}
const con = connection(mysql, options)
const sessionStore = new MySQLStore(options)

let csrf_guid = Guid.raw()
const api_version = 'v1.0'
const app_id = process.env.FB_APPID
const app_secret = process.env.FB_SECRET
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.1/me'
const token_exchange_base_url = 'https://graph.accountkit.com/v1.1/access_token'

app.use(session({
  key: process.env.SES_KEY,
  secret: process.env.SES_SECRET,
  genid: req => uuid.v4(),
  cookie: { maxAge: 1000 * 60 * 10 },
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  httpOnly: true,
  secure: true,
  ephemeral: true
}))

app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(con)
app.use(express.static(__dirname + '/public'))

app.post('/sendcode', login)
app.post('/getin', getin)
app.post('/senddata', registerName)
app.get('/gettransaction', ensureLoggedIn, displayTx)
app.post('/upload', multer({ dest: './uploads/'}).single('upl'), uploadFiles)
app.post('/addTransaction', addTx)
app.post('/updatedata', updateTo)
app.post('/registername', registerName)
app.get('/getuserdetails', userDetails)
app.get('/logout', logout)
app.get('/', initialize)

app.listen(3000, () => console.log('Listening at port 3k'))

loadLogin = () => fs.readFileSync('public/login.html').toString()
loadLoginSuccess = () => fs.readFileSync('public/login_success.html').toString()
loadRegister = () => fs.readFileSync('public/register.html').toString()
loadHomePage = () => fs.readFileSync('public/home.html').toString()

function login (req, res) {
  // CSRF check
  if (req.body.csrf_nonce === csrf_guid) {
    var app_access_token = ['AA', app_id, app_secret].join('|')
    var params = {
      grant_type: 'authorization_code',
      code: req.body.code,
      access_token: app_access_token
      // appsecret_proof: app_secret
    }
    // exchange tokens
    let token_exchange_url = token_exchange_base_url + '?' + Querystring.stringify(params)
    Request.get({url: token_exchange_url, json: true}, function (err, resp, respBody) {
      var view = {
        user_access_token: respBody.access_token,
        expires_at: respBody.expires_at,
        user_id: respBody.id
      }
      // get account details at /me endpoint
      let me_endpoint_url = me_endpoint_base_url + '?access_token=' + respBody.access_token
      Request.get({url: me_endpoint_url, json: true }, function (err, resp, respBody) {
        // send login_success.html
        if (respBody.phone) {
          view.method = 'SMS'
          view.identity = respBody.phone.number
        }
        req.getConnection((err, connection) => {
          if (err) {
            console.log('Connection Error')
            return err
          }
          console.log(respBody)
          req.session.user = respBody.id
          connection.query('SELECT name FROM userDetails WHERE fbSign = ?',
          respBody.id, function (err, rows) {
            if (rows.length === 0 || rows[0].name === null) {
              connection.query('INSERT INTO login VALUES (?, ?)', [req.session.user, req.session.id])
              connection.query('INSERT INTO userDetails (fbSign, phone) VALUES (?, ?)',
              [req.session.user, respBody.phone.national_number])
              var html = Mustache.to_html(loadRegister(), view)
              res.send(html)
            } else {
              connection.query(`UPDATE login SET sID = ? WHERE fbSign = ?`,
              [req.session.id, req.session.user])
              let html = Mustache.to_html(loadHomePage(), view)
              res.send(html)
            }
          })
        })
      })
    })
  } else {
    // login failed
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end('Something went wrong. :( ')
  }
}

function getin (req, res) {
  req.session.user = process.env.PRIVATE_KEY
  let html = Mustache.to_html(loadHomePage())
  res.send(html)
}

function initialize (req, res) {
  const id = req.session.user
  const view = {
    appId: app_id,
    csrf: csrf_guid,
    version: api_version
  }
  if (req.session.user) {
    req.getConnection((err, connection) => {
       if (err) { connectError(err) }
       else {
         connection.query(`SELECT sID FROM login WHERE fbSign = ?`, id, (err, rows) => {
           if (rows.length === 0) {
             let html = Mustache.to_html(loadLogin(), view)
             res.send(html)
           }
           else if (rows[0].sID === req.session.id) {
             connection.query(`SELECT * FROM userDetails WHERE fbSign = ?`, id, (err, rows) => {
               console.log(`-----${rows}-----${rows.length}------`)
               if (rows.length === 0) {
                 let html = Mustache.to_html(loadRegister(), view)
                 res.send(html)
               } else {
                 let html = Mustache.to_html(loadHomePage())
                 res.send(html)
               }
             })
           }
         })
       }
     })
   }
   else {
     let html = Mustache.to_html(loadLogin(), view)
     res.send(html)
   }
 }

function registerName (req, res) {
  req.getConnection((err, connection) => {
    if (err) { connectError(err) }
    else {
      connection.query('UPDATE userDetails SET name = ?, primaryBank = ? WHERE fbSign = ?', [req.body.name, req.body.bank, req.body.id])
      let html = Mustache.to_html(loadHomePage())
      res.send(html)
    }
  })
}

function displayTx (req, res) {
  const id = req.session.user
  req.getConnection((err, connection) => {
    if (err) { connectError(err) }
    else {
      connection.query(`SELECT * FROM icici WHERE fbSign = ?
        UNION
        SELECT * FROM transactions WHERE fbSign = ?
        `, [id, id], (err, rows) => {
        if (err) {
          console.log('Connection error. Pleas try again later')
          return null
        }
        if (rows.length === 0) {
          console.log('No transaction data available')
          return null
        }
        res.send({
          transactions: rows
        })
      })
    }
  })
}

function uploadFiles (req, res) {
  const bank = req.body.bank
  const fbSign = req.session.user
  const fileType = req.body.filetype
  let  tDate, tType, tAmount, tDetails, bal, tCr, tDb, parser

  if (fileType == 'csv') parser = require(__dirname + '/scripts/csvParser')
  else parser = require(__dirname + '/scripts/xmlParser')
  const data = parser()

 req.getConnection((err, connection) => {
    if (err) { connectError(err) }
    else {
      for (let i = 0; i < data.length; i++) {
        if (bank === 'icici') [ , , tDate, chqNo, tDetails, tDb, tCr, bal] = data[i];
        if (bank === 'federal') [ , tDate, tDetails, , , , , tDb, tCr, bal] = data[i];
        if (bank === 'axis') [ , tDate, , tDetails, tDb, tCr, bal, ] = data[i];
        if (tDb == 0) {
          tType = 'CREDIT'
          tAmount = tCr
        } else {
          tType = 'DEBIT'
          tAmount = tDb
        }
        connection.query('INSERT INTO ' + bank + ' (fbSign, tDate, tDetails, tAmount, tType, bal)' +
        'VALUES (?, ?, ?, ?, ?, ?)',
        [fbSign, tDate, tDetails, tAmount, tType, bal], (err, rows) => {
          if (err || rows.affectedRows === 0) { connectError(err) }
        })
      }
      res.redirect('/')
    }
  })
}

function addTx (req, res) {
  const data = req.body
  let [fbSign, tDate, toAcc, fromAcc, tType, tAmount, tDetails] = [req.session.user, data.tDate, data.toAcc, data.fromAcc, data.tType, data.tAmount, data.tDetails]
  let bal = 0
  console.log(req.session.user, data.tDate, data.toAcc, data.fromAcc, data.tType, data.tAmount, data.tDetails)
  req.getConnection((err, connection) => {
    if (err) {
      console.log('Connection Error')
      return err
    }
    connection.query(`SELECT bal FROM transactions WHERE fbSign = ?
      ORDER BY tID DESC LIMIT 1`,
    fbSign, (err, rows) => {
      if (err) { connectError(err) }
      console.log(rows)
      if (rows.length !== 0) bal = parseInt(rows[0].bal)
      if (tType == 'CREDIT' || tType == 'credit') {
        bal += parseInt(tAmount)
        console.log("if balance", bal)
        console.log(typeof bal)
      }
      else {
        bal -= parseInt(tAmount)
        console.log("balance", bal)
        console.log(typeof bal)
      }
      connection.query(`INSERT INTO transactions (fbSign, tDate, fromAcc, toAcc, tType, tAmount, tDetails, bal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [fbSign, tDate, fromAcc, toAcc, tType, tAmount, tDetails, bal], (err, rows) => {
        if (err || rows.affectedRows === 0) { connectError(err) }
      })
    })
  })
}

function updateTo (req, res) {
  const id = req.session.user
  console.log(req.body)
  let [tID, fromAcc, toAcc] = req.body;
  fromAcc = fromAcc.toLowerCase()
  req.getConnection((err, connection) => {
    if (err) { connectError(err) }
    connection.query('UPDATE ' + fromAcc + ' SET toAcc = ? ' +
      'WHERE fbSign = ?', [toAcc, id], (err, rows) => {
        if (err) { connectError(err) }
        res.redirect('/')
      })
  })
}

function userDetails (req, res) {
  const id = req.session.user
  console.log('adafefreyeyruy', id)
  req.getConnection(function (err, connection) {
    connection.query(`SELECT name, primaryBank FROM userDetails WHERE fbSign = ?`, id, (err, rows) => {
            if (err) {
              console.log("inside if")
               connectError(err)  }
      else {
        res.send({
          name: rows[0].name,
          bank: rows[0].primaryBank
        })
      }
    })
  })
}

function ensureLoggedIn (req, res, next) {
  if (req.session.user) next()
  else {
    res.redirect('/')
  }
}

function logout (req, res) {
  delete req.session
  req.getConnection(function (err, connection) {
    connection.query(`UPDATE login SET sID = null WHERE fbSign = ?`, req.session.user)
  })
  req.session.destroy(function () {
    res.redirect('/')
  })
}

function connectError (err) {
  console.log('Connection Error. Please try again later.')
  return err
}
