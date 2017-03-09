const React = require('react')

const AddTransaction = React.createClass({
  componentWillMount: function () {
    this.setState({
      dateErrorDisplay: 'none',
      dateErrorMsg: '',
      validDay: true,
      validMonth: true,
      validYear: true,
      validAmount: true,
      submitOff: true
    })
  },
  validateInput: function (e) {
    const data = parseInt(e.target.value)
    if (e.target.name === 'tDate1') {
      if (data.toString() === 'NaN') {
        this.setState({
          dateErrorDisplay: 'block',
          dateErrorMsg: 'Invalid Date. Use Numbers.',
          validDay: false
        })
      }
      else if (data > 31) {
        this.setState({
          dateErrorDisplay: 'block',
          dateErrorMsg: 'Invalid Date.',
          validDay: true
        })
      } else {
        this.setState({
          dateErrorDisplay: 'none',
          dateErrorMsg: '',
          validDay: true
        })
      }
    }

    if (e.target.name === 'tDate2') {
      if (data > 12) {
        this.setState({
          dateErrorDisplay: 'block',
          dateErrorMsg: 'Invalid Month.',
          validMonth: false
        })
      } else {
        this.setState({
          dateErrorDisplay: 'none',
          dateErrorMsg: '',
          validMonth: true
        })
      }
    }

    if (e.target.name === 'tDate3') {
      if (data < 2000 || data > 2017) {
        this.setState({
          dateErrorDisplay: 'block',
          dateErrorMsg: 'Invalid Year',
          validYear: false
        })
      } else {
        this.setState({
          dateErrorDisplay: 'none',
          dateErrorMsg: '',
          validYear: true
        })
      }
    }

    if (e.target.name === 'tAmount') {
      if (data.toString() === 'NaN') {
        this.setState({
          dateErrorDisplay: 'block',
          dateErrorMsg: 'Invalid Amount. Use Numbers.',
          validAmount: false
        })
      } else {
        this.setState({
          validAmount: true
        })
      }
    }
  },
  change: function (res) {
    window.location.hash = '#/'
  },
  changeButton: function () {
    if (this.refs.tDate1.value && this.refs.tDate2.value && this.refs.tDate3.value &&
    this.refs.tDetails.value && this.refs. tAmount.value && this.state.validDay &&
    this.state.validMonth && this.state.validYear && this.state.validAmount) {
      this.setState({
        submitOff: false
      })
    }
  },
  render: function () {
    return (
      <div style = {{fontSize : '16px'}}>
        <form name='addtransaction' method='POST' action='/addTransaction' onSubmit={this.change}>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='tDate' className='text-right middle'>Date of transaction</label>
           </div>
           <div className='small-1 columns'>
            <input type='text' ref = 'tDate1' name='tDate1' placeholder = 'DD' maxLength="2" size="2" onBlur = {this.validateInput.bind(this)} required/>
           </div>
           <div className='small-1 columns'>
            <input type='text' ref = 'tDate2' name='tDate2' placeholder = 'MM' maxLength="2" size="2" onBlur = {this.validateInput.bind(this)} required/>
           </div>
           <div className='small-2 columns'>
            <input type='text' ref = 'tDate3' name='tDate3' placeholder = 'YYYY' maxLength="4" size="4" onBlur = {this.validateInput.bind(this)} required/>
           </div>
           <div ref = 'dateError' className='small-5 columns' display = {this.state.dateErrorDisplay}>
             {this.state.dateErrorMsg}
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='tDetails' className='text-right middle'>Details</label>
           </div>
           <div className='small-9 columns'>
            <input type='text' ref = 'tDetails' name='tDetails' placeholder='Transaction details go here' required/>
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='tAmount' className='text-right middle'>Amount</label>
           </div>
           <div className='small-9 columns'>
            <input type='text' ref = 'tAmount' name='tAmount' placeholder='₹' required/>
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='tType' className='text-right middle'>Type of transaction</label>
           </div>
           <div className='small-9 columns'>
               <select name='tType' defaultValue = 'Debit'>
                 <option value='Credit'>Credit</option>
                 <option value='Debit'>Debit</option>
               </select>
             </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='fromAcc' className='text-right middle'>From account</label>
           </div>
           <div className='small-9 columns'>
             <select name='fromAcc' defaultValue = 'Axis'>
               <option value='AXIS'>Axis</option>
               <option value='ICICI'>ICICI</option>
               <option value='FEDERAL'>Federal</option>
             </select>
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='toAcc' className='text-right middle'>To account</label>
           </div>
           <div className='small-9 columns'>
             <select name='toAcc' defaultValue = 'Bank'>
               <option value='Bank'>Bank</option>
               <option value='Cash'>Cash</option>
               <option value='Expense'>Expense</option>
               <option value='Shareholders Capital'>Shareholders Capital</option>
               <option value='Income'>Income</option>
             </select>
           </div>
          </div>
          <div className='row'>
           <div className='small-12 columns' style={{paddingLeft: '50%'}}>
          <button className='button btn' onClick = {this.validateInput} onMouseOver = {this.changeButton} disabled = {this.state.submitOff}>Submit</button>
          </div>
        </div>
        </form>
      </div>
    )
  }
})

module.exports = AddTransaction
