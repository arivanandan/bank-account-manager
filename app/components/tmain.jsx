const React = require('react')
const TransactionList = require('TransactionList')
const {getJSON} = require('io-square-browser')

const TMain = React.createClass({
  // componentDidUpdate: function () {
  //   getJSON('/gettransaction').then((response) => {
  //     this.setState(
  //       {transactions: response.transactions}
  //     )
  //   })
  // },
  getUserData: function(){
     getJSON('/gettransaction').then((response) => {
      this.setState(
        {transactions: response.transactions}
      )
    })
  },
  componentDidMount: function () {
   this.getUserData()
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
        <TransactionList transactions={transactions} getUserData={this.getUserData}/>
      </div>
    )
  }
})

module.exports = TMain
