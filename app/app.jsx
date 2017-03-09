const React = require('react')
const ReactDOM = require('react-dom')
const {Route, Router, IndexRoute, browserHistory} = require('react-router')
const Main = require('Main')
const Upload = require('Upload')
const TMain = require('TMain')
const AddTransaction = require('AddTransaction')
const ViewGraph = require('ViewGraph')
require('style!css!foundation-sites/dist/css/foundation.min.css')
$(document).foundation()

require('style!css!sass!applicationStyles')
require('style!css!sass!graphStyles')

ReactDOM.render(
<Router history={browserHistory}>
  <Route path = '/getin' component={Main}>
    <Route path = '/upload' component={Upload}/>
    <Route path = '/addtransaction' component={AddTransaction}/>
    <Route path = '/viewgraph' component={ViewGraph}/>
    <Route path = '/tx' component={TMain} />
    <IndexRoute component = {TMain}/>
  </Route>
  <Route path = '/sendcode' component={Main}>
    <Route path = '/upload' component={Upload}/>
    <Route path = '/addtransaction' component={AddTransaction}/>
    <Route path = '/viewgraph' component={ViewGraph}/>
    <Route path = '/tx' component={TMain} />
    <IndexRoute component = {TMain}/>
  </Route>
  <Route path = '/' component={Main}>
    <Route path = '/upload' component={Upload}/>
    <Route path = '/addtransaction' component={AddTransaction}/>
    <Route path = '/viewgraph' component={ViewGraph}/>
    <Route path = '/tx' component={TMain} />
    <IndexRoute component = {TMain}/>
  </Route>
</Router>,
  document.getElementById('app')
)
