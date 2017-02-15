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
// const routes = require('./routes.js')

const fs = require('fs')
const Guid = require('guid')
const Mustache = require('mustache')
const Request = require('request')
const Querystring = require('querystring')
const path = require('path')
const formidable = require('formidable')

const options = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'expenseApp'
}
const con = connection(mysql, options)
const sessionStore = new MySQLStore(options)

let csrf_guid = Guid.raw()
const api_version = 'v1.0'
const app_id = '354578414912778'
const app_secret = '95bf1f8379d7cd0bf5fb8a9c62416a37'
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.1/me'
const token_exchange_base_url = 'https://graph.accountkit.com/v1.1/access_token'

app.use(session({
  key: 'session',
  secret: `|s9a003==-32-3[\''ads.,@ZN'`,
  genid: req => uuid.v4(),
  cookie: { maxAge: 60000 },
  resave: true,
  saveUninitialized: true,
  store: sessionStore,
  maxAge: 1000 * 60 * 500,
  httpOnly: true,
  secure: true,
  ephemeral: true
}))

app.use(logger('dev'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
//app.set('view engine', 'html')
//app.engine('html', require('hbs').__express)
app.use(con)
app.use(express.static(__dirname + '/public'))

app.post('/sendcode', login)
app.post('/getin', getin)
app.post('/senddata', registerName)
app.get('/gettransaction', displayTx)
app.post('/upload', multer({ dest: './uploads/'}).single('upl'), uploadFiles)
app.post('/addTransaction', addTx)
app.post('/updatedate', updateTo)
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
          req.session.user = respBody.phone.national_number
        connection.query('SELECT name FROM login WHERE fbSign = ?', respBody.id, function (err, rows) {
          if (rows.length === 0 || rows[0].name === null) {
            connection.query('INSERT INTO login VALUES (?, ?, ?, ?)', [respBody.id, req.session.id, null, respBody.phone.national_number])
            var html = Mustache.to_html(loadRegister(), view)
            res.send(html)
          } else {
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
  req.session.user = 201320543668190
  let html = Mustache.to_html(loadHomePage())
  res.send(html)
}

function registerName (req, res) {
  req.getConnection((err, connection) => {
    if (err) {
      console.log('Connection Error')
      return err
    }
  connection.query('UPDATE login SET name = ? WHERE fbSign = ?', [req.body.name, req.body.id])
  let view = {

  }
  let html = Mustache.to_html(loadHomePage(), view)
  res.send(html)
  })
}

function displayTx (req, res) {
  const id = req.session.user
  req.getConnection((err, connection) => {
    if (err) {
      console.log('Connection Error')
      return err
    }
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
  })
}

function initialize (req, res) {
  const view = {
    appId: app_id,
    csrf: csrf_guid,
    version: api_version
  }
  const html = Mustache.to_html(loadLogin(), view)
  res.send(html)
}

function uploadFiles (req, res) {
  const bank = req.body.bank
  const fbSign = req.session.user
  const parser = require(__dirname + '/scripts/parser')
  const data = parser()
  let  tDate, tType, tAmount, tDetails, bal, tCr, tDb
  console.log(bank)


 req.getConnection((err, connection) => {
    if (err) {
      console.log('Connection Error')
      return err
    }
    for (let i = 0; i < data.length; i++) {
      if (bank === 'icici') [ , , tDate, chqNo, tDetails, tDb, tCr, bal] = data[i];
       if (bank === 'federal') [ , tDate, tDetails, , , , , tDb, tCr, bal] = data[i];
      if (tDb == 0) {
        tType = 'CREDIT'
        tAmount = tCr
      } else {
        tType = 'DEBIT'
        tAmount = tDb
      }
      if (tDetails.substr(0, 3) === 'ATM' || tDetails.substr(0, 3) === 'NFS') tType = 'CREDIT'
      console.log(fbSign, tDate, tDetails, tAmount, tType, bal)
      connection.query('INSERT INTO ' + bank + ' (fbSign, tDate, tDetails, tAmount, tType, bal)' +
      'VALUES (?, ?, ?, ?, ?, ?)',
      [fbSign, tDate, tDetails, tAmount, tType, bal], (err, rows) => {
        if (err || rows.affectedRows === 0) {
          console.log('Connection Error. Please try again later.')
          console.log(err)
          return null
        }
      })
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
      if (err) {
        console.log('Connection Error. Please try again later.')
        return err
      }
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
        if (err || rows.affectedRows === 0) {
          console.log('Connection Error. Please try again later.')
          console.log(err)
          return null
        }
      })
    })
  })
}

function updateTo (req, res) {
  const id = req.session.user
}
