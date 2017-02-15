const React = require('react')

const AddTransaction = React.createClass({
  render: function () {
    return (
      <div>
        <form name='addtransaction' method='POST' action='/addTransaction'>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='tDate' className='text-right middle'>Date of transaction</label>
           </div>
           <div className='small-9 columns'>
            <input type='date' name='tDate' id='date'/>
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='tDetails' className='text-right middle'>Details</label>
           </div>
           <div className='small-9 columns'>
            <input type='text' name='tDetails' placeholder='enter the details'/>
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='tAmount' className='text-right middle'>Amount</label>
           </div>
           <div className='small-9 columns'>
            <input type='text' name='tAmount' placeholder='enter the amount'/>
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='tType' className='text-right middle'>Type of transaction</label>
           </div>
           <div className='small-9 columns'>
            <input type='text' name='tType' placeholder='type of transaction'/>
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='fromAcc' className='text-right middle'>From account</label>
           </div>
           <div className='small-9 columns'>
             <select name='fromAcc'>
               <option value='bank'>Bank</option>
               <option value='cash'>Cash</option>
               <option value='income'>Income</option>
             </select>
           </div>
          </div>
          <div className='row'>
           <div className='small-3 columns'>
             <label htmlFor='toAcc' className='text-right middle'>To account</label>
           </div>
           <div className='small-9 columns'>
             <select name='toAcc'>
               <option value='bank'>Bank</option>
               <option value='cash'>Cash</option>
               <option value='income'>Income</option>
             </select>
           </div>
          </div>
          <button className='button expanded btn'>Submit</button>
        </form>
      </div>
    )
  }
})

module.exports = AddTransaction
