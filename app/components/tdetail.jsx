const React = require('react')
const {postJSON} = require('io-square-browser')

const Tdetail = React.createClass({
  handleRadio: function (e) {
    let bank = this.refs.bank.checked
    let cash = this.refs.cash.checked
    let expense = this.refs.expense.checked
    let id = this.props.id
    let fromAcc = this.props.fromAcc
    console.log(id,fromAcc)
    let obj = {}
    if (bank) {
      obj = {
        tID: id,
        toAcc: 'bank',
        fromAcc: fromAcc
      }
    } else if (cash) {
      obj = {
        tID: id,
        toAcc: 'cash',
        fromAcc: fromAcc
      }
    } else {
      obj = {
        tID: id,
        toAcc: 'expense',
        fromAcc: fromAcc
      }
    }
    postJSON('/updatedata', obj)
  },
  render: function () {
    let tDetail = this.props.tDetail
    let toAcc = this.props.toAcc
    let renderUpdate = () => {
      if (toAcc) {
        return (
          <div>
            <br/>
            <div className='row'>
              <div className='small-2 large-4 columns'>
                <label>
                  <input type='radio' name='value' value='bank' ref='bank' onChange={this.handleRadio}/> Bank Account
                </label>
              </div>
              <div className='small-2 large-4 columns'>
                <label>
                  <input type='radio' name='value' ref='cash' onChange={this.handleRadio}/> Cash Account
                </label>
              </div>
              <div className='small-2 large-4 columns'>
                <label>
                  <input type='radio' name='value' ref='expense' onChange={this.handleRadio}/> Expense
                </label>
              </div>
            </div>
          </div>
        )
      }
    }
    return (
      <div>
        <div className=' columns'>
          <div className='row'>
            {tDetail}
          </div>
          {renderUpdate()}
        </div>
      </div>
    )
  }
})

module.exports = Tdetail
