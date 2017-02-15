const React = require('react')
const Transaction = require('Transaction')

const TransactionList = React.createClass({
  render: function () {
    let {transactions} = this.props
    let renderTransactions = () => {
      return transactions.map((transaction) => {
        return (
          <Transaction key={transaction.tID} {...transaction}/>
        )
      })
    }
    return (
      <div>
        {renderTransactions()}
      </div>
    )
  }
})

module.exports = TransactionList
