const React = require('react')
const {postJSON} = require('io-square-browser')
const {hashHistory} = require('react-router')

const Transaction = React.createClass({
  handleSelect: function (e) {
    let toAcc = this.refs.toAcc.value
    let {tID, fromAcc} = this.props
    let obj = {
      tID : tID,
      toAcc: toAcc,
      fromAcc: fromAcc
    }
    postJSON('/updatedata', obj).then((...a) => {
      this.props.getUserData()
    })
  },
  render: function () {
    let {tDate, tDetails, tAmount, bal, toAcc, fromAcc, tType} = this.props
    tDate = `${tDate.substr(6, 2)}-${tDate.substr(4, 2)}-${tDate.substr(0, 4)}`
    let type, optionBg
    if (tType == 'credit' || tType == 'CREDIT') {
      type = 'Cr'
      optionBg = 'optionCr'
    } else {
      type = 'Db'
      optionBg = 'optionDb'
    }
    let renderToAcc = () => {
      if (!toAcc) {
        return (
          <div className='small-4 columns' style={{fontSize: '12px'}}>
             <select ref='toAcc' name='toAcc' onChange={this.handleSelect} className = 'txSelect'>
              <option value='Bank' className = {optionBg}>Bank</option>
              <option value='Cash' className = {optionBg}>Cash</option>
              <option value='Expense' className = {optionBg}>Expense</option>
              <option value='Fixed Asset' className = {optionBg}>Fixed Asset</option>
              <option value='Income' className = {optionBg}>Income</option>
              <option value='Shareholders Capital' className = {optionBg}>Shareholders Capital</option>
             </select>
           </div>
        )
      }
      return (
        <div className='small-4 columns' style={{fontSize: '16px'}}>
          {toAcc}
        </div>
     )
    }
    return (
      <div className={type}>
        <div className='card-section'>
            <div className='row' style={{fontSize: '16px'}}>
              <div className='small-2 columns' style={{textAlign: 'left'}}>
                {tDate}
              </div>
              <div className='small-6 columns' style={{textAlign: 'left', wordWrap:'break-word'}}>
                {tDetails}
              </div>
              <div className='small-2 columns' style={{textAlign: 'right'}}>
              {tAmount}₹<span style = {{fontSize: '12px'}} >  {type}</span>
              </div>
            </div>
            <br></br>
            <div className='row'>
                  <div className='small-2 columns' style={{textAlign: 'left'}}>
                    To account
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
