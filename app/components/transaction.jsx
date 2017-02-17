const React = require('react')
const {postJSON} = require('io-square-browser')

const Transaction = React.createClass({
  handleSelect: function (e) {
    let toAcc = this.refs.toAcc.value
    let {tID, fromAcc} = this.props
    let obj = {
      tID : tID,
      toAcc: toAcc,
      fromAcc: fromAcc
    }
    postJSON('/updatedata', obj).then((response) => {
      window.location.hash = '#/upload'
    })
  },
  render: function () {
    let {tDate, tDetails, tAmount, bal, toAcc, fromAcc, tType} = this.props
    let type
    if (tType == 'credit' || tType == 'CREDIT') {
      type = 'Cr'
    } else {
      type = 'Db'
    }
    let renderToAcc = () => {
      if (!toAcc) {
        return (
          <div className='small-4 columns'>
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
        <div className='small-4 columns' style={{paddingTop: '1.5%'}}>
          {toAcc}
        </div>
     )
    }
    return (
      <div className='card box-style' style={{width: '100%', paddingTop: '0.5%'}} >
        <div className='card-section'>
            <div className='row' style={{fontSize: '25px'}}>
              <div className='large-3 columns' style={{textAlign: 'center'}}>
                {tDate}
              </div>
              <div className='large-6 columns' style={{textAlign: 'center'}}>
                {tDetails}
              </div>
              <div className='large-3 columns' style={{textAlign: 'center'}}>
              {tAmount} {type}
              </div>
            </div>
            <div className='row' style={{paddingTop: '3%', fontSize: '20px'}}>
                  <div className='small-2 columns' style={{textAlign: 'left'}}>
                    <label htmlFor='toAcc' className='text-right middle'><strong>To account</strong></label>
                 </div>
                  {renderToAcc()}
                  <div className='small-6 columns' style={{textAlign: 'right'}}>
                    Balance: {bal}
                  </div>
              </div>
          </div>
        </div>
    )
  }
})

module.exports = Transaction
