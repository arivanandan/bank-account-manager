const React = require('react')
const ReactDOM = require('react-dom')
const {Route, Router, IndexRoute, hashHistory} = require('react-router')
const Main = require('Main')
const Upload = require('Upload')
const TMain = require('TMain')
const AddTransaction = require('AddTransaction')

// load foundation
require('style!css!foundation-sites/dist/css/foundation.min.css')
$(document).foundation()

// App css
require('style!css!sass!applicationStyles')

ReactDOM.render(
<Router history={hashHistory}>
  <Route path='/' component={Main}>
  <Route path='upload' component={Upload}/>
  <Route path='addtransaction' component={AddTransaction}/>
  <IndexRoute component={TMain}/>
  </Route>
</Router>,
  document.getElementById('app')
)
