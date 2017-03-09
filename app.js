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
const api_version = 'v1.1'
const app_id = process.env.FB_APPID
const app_secret = process.env.FB_SECRET
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.1/me'
const token_exchange_base_url = 'https://graph.accountkit.com/v1.1/access_token'
const view = {
  appId: app_id,
  csrf: csrf_guid,
  version: api_version
}

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
app.use(bodyParser.text())
app.use(bodyParser.json())
app.use(con)
app.disable('etag')
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
app.get('/viewGraph', graphData)
app.get('*', initialize)

app.listen(3000, () => console.log('Listening at port 3k'))

loadLogin = () => fs.readFileSync('public/login.html').toString()
loadLoginSuccess = () => fs.readFileSync('public/login_success.html').toString()
loadRegister = () => fs.readFileSync('public/register.html').toString()
loadHomePage = () => fs.readFileSync('public/home.html').toString()
loadUploadError = () => fs.readFileSync('public/errorUpl.html').toString()
loadAddError = () => fs.readFileSync('public/errorAdd.html').toString()

function login (req, res) {
  if (req.body.csrf_nonce === csrf_guid) {
    var app_access_token = ['AA', app_id, app_secret].join('|')
    var params = {
      grant_type: 'authorization_code',
      code: req.body.code,
      access_token: app_access_token
    }
    let token_exchange_url = token_exchange_base_url + '?' + Querystring.stringify(params)
    Request.get({url: token_exchange_url, json: true}, function (err, resp, respBody) {
      var view = {
        user_access_token: respBody.access_token,
        expires_at: respBody.expires_at,
        user_id: respBody.id
      }

      let me_endpoint_url = me_endpoint_base_url + '?access_token=' + respBody.access_token
      Request.get({url: me_endpoint_url, json: true }, function (err, resp, respBody) {
        console.log(respBody)
        if (respBody.phone) {
          view.method = 'SMS'
          view.identity = respBody.phone.number
        }

        req.getConnection((err, connection) => {
          if (err) {
            console.log('Connection Error')
            return err
          }
          req.session.user = respBody.id
          connection.query('SELECT name FROM userDetails WHERE fbSign = ?',
          respBody.id, function (err, rows) {
            if (rows === '' || rows.length === 0) {
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
    let html = Mustache.to_html(loadLogin(), view)
    res.send(html)
  }
}

function getin (req, res) {
  req.session.user = process.env.PRIVATE_KEY
  let html = Mustache.to_html(loadHomePage())
  res.send(html)
}

function initialize (req, res) {
  console.log(req.session.id)
  const id = req.session.user
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
               if (rows.length === 0) {
                 let html = Mustache.to_html(loadRegister(), view)
                 res.send(html)
               } else {
                 let html = Mustache.to_html(loadHomePage())
                 res.send(html)
               }
             })
           } else {
             let html = Mustache.to_html(loadLogin(), view)
             res.send(html)
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
      connection.query(`SELECT * FROM axis WHERE fbSign = ?
        UNION
        SELECT * FROM icici WHERE fbSign = ?
        UNION
        SELECT * FROM federal WHERE fbSign = ?
        ORDER BY tDate DESC`,
	[id, id, id], (err, rows) => {
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
  else parser = require(__dirname + '/scripts/xlsParser')
  const data = parser()

 req.getConnection((err, connection) => {
    if (err) { connectError(err, res) }
    else {
      connection.query('SELECT tDate FROM ' + bank + ' WHERE fbSign = ? ORDER BY tDate DESC LIMIT 1',
      fbSign, (err, rows) => {
        if (err) { connectError(err, res) }
        else if (rows.toString() === '' || parseInt(rows[0].tDate) < parseInt(dateFixer(dateReturn(data, bank)))) {
          for (let i = 0; i < data.length; i++) {
            if (bank === 'icici') [ , , tDate, , tDetails, tDb, tCr, bal] = data[i];
            if (bank === 'federal') [ , tDate, tDetails, , , , , tDb, tCr, bal] = data[i];
            if (bank === 'axis') [ , tDate, , tDetails, tDb, tCr, bal, ] = data[i];
            if (tDb == 0) {
              tType = 'CREDIT'
              tAmount = stripCommas(tCr)
            } else {
              tType = 'DEBIT'
              tAmount = stripCommas(tDb)
            }
            bal = stripCommas(bal)
            tDate = dateFixer(tDate)
            connection.query('INSERT INTO ' + bank + ' (fbSign, tDate, tDetails, tAmount, tType, bal)' +
            'VALUES (?, ?, ?, ?, ?, ?)',
            [fbSign, tDate, tDetails, tAmount, tType, bal], (err, rows) => {
              if (err || rows.affectedRows === 0) {
		              let html = Mustache.to_html(loadUploadError())
          	      res.send(html)
		              return err
		            }
            })
          }
          let html = Mustache.to_html(loadHomePage())
          res.send(html)
        }
        else {
          let html = Mustache.to_html(loadUploadError())
          res.send(html)
        }
      })
    }
  })
}

function addTx (req, res) {
  const data = req.body
  let [fbSign, tDate1, tDate2, tDate3, toAcc, fromAcc, tType, tAmount, tDetails] = [req.session.user, data.tDate1, data.tDate2, data.tDate3, data.toAcc, data.fromAcc, data.tType, data.tAmount, data.tDetails]
  if (!addTxValidator(tDate1, tDate2, tDate3, tAmount)) {
    res.send('Invalid Data.')
    return null
  }
  if (tDate1.length != 2) tDate1 = datePad(tDate1, 2)
  if (tDate2.length != 2) tDate2 = datePad(tDate2, 2)
  if (tDate3.length != 4) tDate3 = datePad(tDate3, 4)
  let tDate = dateFixer(`${tDate1}-${tDate2}-${tDate3}`)
  let bal = 0
  let bank = fromAcc.toLowerCase()
  req.getConnection((err, connection) => {
    if (err) { connectError(err, res) }
    connection.query('SELECT bal FROM ' + bank + ' WHERE fbSign = ? ORDER BY tID DESC LIMIT 1',
    fbSign, (err, rows) => {
      if (err) { connectError(err, res) }
      if (rows.length !== 0) bal = parseInt(rows[0].bal)
      if (tType == 'Credit') bal += parseInt(stripCommas(tAmount))
      else bal -= parseInt(stripCommas(tAmount))
      connection.query('INSERT INTO ' + bank +' (fbSign, tDate, fromAcc, toAcc, tType, tAmount, tDetails, bal)' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [fbSign, tDate, fromAcc, toAcc, tType, tAmount, tDetails, bal], (err, rows) => {
        if (err || rows.affectedRows === 0) {
          let html = Mustache.to_html(loadAddError())
          res.send(html)
        }
      })
    })
  })
}

function updateTo (req, res) {
  const id = req.session.user
  let {tID, fromAcc, toAcc} = req.body
  fromAcc = fromAcc.toLowerCase()
  req.getConnection((err, connection) => {
    if (err) { connectError(err) }
    connection.query('UPDATE ' + fromAcc + ' SET toAcc = ? WHERE fbSign = ? AND tID = ?',
    [toAcc, id, tID], (err, rows) => {
        if (err) { connectError(err, res) }
        else {
          res.redirect('/')
        }
      })
  })
}

function userDetails (req, res) {
  const id = req.session.user
  req.getConnection(function (err, connection) {
    connection.query(`SELECT name, primaryBank FROM userDetails WHERE fbSign = ?`, id, (err, rows) => {
      if (err) { connectError(err) }
      else {
          res.send({
          name: rows[0].name,
          bank: rows[0].primaryBank
        })
      }
    })
  })
}

function graphData (req, res) {
  const id = req.session.user
  req.getConnection(function (err, connection) {
    connection.query(`SELECT * FROM(
      SELECT bal, fromAcc FROM axis WHERE fbSign = ? ORDER BY tID DESC LIMIT 1) AS axis
      UNION ALL
      SELECT * FROM(
        SELECT bal, fromAcc FROM icici WHERE fbSign = ? ORDER BY tID DESC LIMIT 1) AS icici
      UNION ALL
      SELECT * FROM(
        SELECT bal, fromAcc FROM federal WHERE fbSign = ? ORDER BY tID DESC LIMIT 1) AS federal`,
        [id, id, id], (err, rows) => {
          if (err) connectError(err, res)
          else res.send(rows)
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
  req.getConnection(function (err, connection) {
    connection.query('UPDATE login SET sID = null WHERE fbSign = ?', req.session.user)
  })
  req.session.destroy(function () {
    delete req.session
    res.redirect('/')
  })
}

function connectError (err, res) {
  console.log('Connection Error. Please try again later.')
  console.log(err)
  res.redirect('/')
  return null
}

function stripCommas (amount) {
  return  parseInt(amount.replace(/,/g, ''))
}

function dateFixer (date) {
  return date.replace(/\//g, '-')
  .split('-')
  .reverse()
  .reduce((acc, cur) => acc + cur, '')
}

function dateReturn (data, bank) {
  let tDate
  if (bank === 'icici') [ , , tDate, , , , , ] = data[0];
  if (bank === 'federal') [ , tDate, , , , , , , , ] = data[0];
  if (bank === 'axis') [ , , , , , , , ] = data[0];
  return tDate
}

function addTxValidator (tDate1, tDate2, tDate3, tAmount) {
  if (tDate1.length > 2) return false
  if (tDate2.length > 2) return false
  if (tDate3.length > 4) return false

  if ((parseInt(stripCommas(tAmount))).toString() === 'NaN') return false

  return true
}

function datePad (date, number) {
  return number === 2 ? new Array (number - date.length + 1).join('0') + date
  : 2017
}
