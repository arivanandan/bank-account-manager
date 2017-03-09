const React = require('react')
const {Link, IndexLink} = require('react-router')
const {getJSON} = require('io-square-browser')

const Nav = React.createClass({
  componentWillMount: function () {
      getJSON('/getuserdetails').then((response) => {
      response.name = (response.name).toUpperCase()
      response.bank = (response.bank).toUpperCase()
      this.setState({
          user : response.name,
          bank : response.bank
        })
    })
  },
  render: function () {
    if(!this.state){
      return (
        <div>
        <p>loading</p>
        </div>
      )
    }
    return (
        <div className='top-bar' id = 'navBarIn'>
          <div className='top-bar-left'>
            <ul className='menu'>
              <li className='menu-text'>ExpenseApp</li>
              <li><Link to='/tx' activeClassName='active' activeStyle={{fontWeight: 'bold'}}>Transactions</Link></li>
              <li><Link to='/upload' activeClassName='active' activeStyle={{fontWeight: 'bold'}}>Upload</Link></li>
              <li><Link to='/addtransaction' activeClassName='active' activeStyle={{fontWeight: 'bold'}}>Add Transaction</Link></li>
              <li><Link to='/viewgraph' activeClassName='active' activeStyle={{fontWeight: 'bold'}}>View Asset Split</Link></li>
             </ul>
          </div>
            <div className='top-bar-right'>
              <ul className='menu'>
                <li className='menu-text'>{this.state.user},</li>
                <li>{this.state.bank}</li>
                  <li><Link href='/logout' activeClassName='active' activeStyle={{fontWeight: 'bold'}}>Logout</Link></li>
              </ul>
            </div>
        </div>
      )
  }
})

module.exports = Nav
