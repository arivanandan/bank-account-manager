const React = require('react')
const TransactionList = require('TransactionList')
const {getJSON} = require('io-square-browser')

const TMain = React.createClass({
  componentWillMount: function () {
    getJSON('/gettransaction').then((response) => {
      this.setState(
        {transactions: response.transactions}
      )
    })
  },
  render: function () {
    // console.log(this.state)
    if (!this.state) {
      return (<div>
        Loading
      </div>)
    }
    let {transactions} = this.state
    return (
      <div>
        <TransactionList transactions={transactions}/>
      </div>
    )
  }
})

module.exports = TMain
