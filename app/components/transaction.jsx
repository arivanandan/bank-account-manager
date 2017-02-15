const React = require('react')
const Tdetail = require('Tdetail')

const Transaction = React.createClass({
  componentWillMount: function () {
    this.setState({
      showDetail: false
    })
  },
  handleClick: function () {
    this.setState({
      showDetail: (!this.state.showDetail)
    })
  },
  render: function () {
    let {tID, tDate, tDetails, tAmount, bal, toAcc, fromAcc} = this.props
    return (
      <div className='card box-style'  style={{width: '100%', paddingTop: '0.5%'}} >
        <div onClick={this.handleClick}>
        <div className='card-divider' style={{marginTop: '3%'}}>
          Bank
        </div>
        <div className='card-section'>
            <div className='row'>
              <div className='small-12 columns float-left'>
                {tDate}
              </div>
            </div>
            <div className='row'>
              <div className='small-6 columns'>
                Amount: {tAmount}
              </div>
              <div className='small-6 columns'>
                Balance: {bal}
              </div>
            </div>
          </div>
          </div>
        {this.state.showDetail ? <Tdetail id={tID} tDetail={tDetails} toAcc={toAcc} fromAcc={fromAcc}/> : null}
      </div>
    )
  }
})

module.exports = Transaction
