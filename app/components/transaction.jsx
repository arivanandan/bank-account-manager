const React = require('react')
const {postJSON} = require('io-square-browser')

const Transaction = React.createClass({
  handleSelect: function (e) {
    let toAcc = this.refs.toAcc.value
    let {tID} = this.props
    let obj = {
      tID : tID,
      toAcc: toAcc
    }
    postJSON('/updatedata', obj)
  },
  render: function () {
    let {tDate, tDetails, tAmount, bal, toAcc, fromAcc, tType} = this.props
    let clr
    let type
    if (tType == 'credit' || tType == 'CREDIT') {
      clr = '#2AC24F'
      type = 'Cr'
    } else {
      clr = '#F8421E'
      type = 'Db'
    }
    let renderToAcc = () => {
      if (!toAcc) {
        return (
             <div className='small-9 columns'>
             <select ref='toAcc' name='toAcc' onChange={this.handleSelect}>
              <option value='bank'>Bank</option>
              <option value='cash'>Cash</option>
              <option value='expense'>Expense</option>
              <option value='fixed_asset'>Fixed Asset</option>
              <option value='income'>Income</option>
              <option value='shareholders_capital'>Shareholders Capital</option>
             </select>
           </div>
        )
      }
      return (
          <div className='small-9 columns'>
          {toAcc}
        </div>
      )
    }
    return (
      <div className='card box-style' style={{width: '100%', paddingTop: '0.5%'}} >
        <div className='card-section'>
            <div className='row align-spaced'>
              <div className='large-4 columns'>
                {tDate}
              </div>
              <div className='large-4 columns'>
                Detail: {tDetails}
              </div>
              <div className='large-2 columns'>
                {type}
              </div>
              <div className='large-2 columns'>
                Amount: {tAmount}
              </div>
            </div>
            <br/>
            <div className='row'>
              <div className='small-3 columns'>
                <label htmlFor='toAcc' className='text-right middle'><strong>To account</strong></label>
              </div>
                {renderToAcc()}
            </div>
            <div className='row'>
              <div className='small-12 columns'>
                Balance: {bal}
              </div>
            </div>
          </div>
      </div>
    )
  }
})

module.exports = Transaction
