const React = require('react')

const Import = React.createClass({
  render: function () {
    return (
      <div>
           <form name='form1' method='post' encType='multipart/form-data' action='/upload'>
               <div className='row'>
                <div className='small-3 columns'>
                  <label htmlFor='bank' className='text-right middle'><strong>Bank</strong></label>
                </div>
                <div className='small-9 columns'>
               <select name='bank'>
                 <option value='icici'>ICICI Bank</option>
                 <option value='federal'>Federal Bank</option>
                 <option value='axis'>Axis Bank</option>
               </select>
             </div>
           </div>
             <div className='row'>
              <div className='small-3 columns'>
                <label htmlFor='filetype' className='text-right middle'><strong>File type</strong></label>
              </div>
                <div className='small-9 columns'>
               <select name='filetype'>
                 <option value='csv'>CSV</option>
                 <option value='xls'>XLS</option>
               </select>
             </div>
             </div>
             <div className='row'>
              <div className='small-12 columns' style={{paddingLeft: '40%'}}>
               <input type='file' name= 'upl' id='file'className='inputfile'/>
               </div>
             </div>
             <div className='row'>
              <div className='small-12 columns' style={{paddingLeft: '50%'}}>
             <button className='button btn'>Submit</button>
             </div>
           </div>
           </form>
         </div>
    )
  }
})

module.exports = Import
