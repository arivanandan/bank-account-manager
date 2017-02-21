const React = require('react')
const {hashHistory} = require('react-router')
const Import = React.createClass({
  getInitialState(){
    return({
      bank: 'select',
      filetype: 'select'
    })
  },
  change: function (res) {
    if(this.state.bank === 'select' || this.state.filetype === 'select' || !this.refs.uploadFile.value){
      alert("Please Select Bank and File Type")
    }
    else{
       this.refs.form1.submit()
    hashHistory.push('/')
    }   
  },
  render: function () {
    return (
      <div>
           <form ref='form1' name='form1' method='post' encType='multipart/form-data' action='/upload'>
               <div className='row'>
                <div className='small-3 columns'>
                  <label htmlFor='bank' className='text-right middle'><strong>Bank</strong></label>
                </div>
                <div className='small-9 columns'>
               <select name='bank' onChange={e => this.setState({bank: e.target.value})}>
                 <option defaultValue='select'>Choose bank</option>
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
               <select name='filetype' onChange={e => this.setState({filetype: e.target.value})}>>
                 <option defaultValue='select'>Choose file type</option>
                 <option value='csv'>CSV</option>
                 <option value='xls'>XLS</option>
               </select>
             </div>
             </div>
             <div className='row'>
              <div className='small-12 columns' style={{paddingLeft: '40%'}}>
               <input type='file' name= 'upl' id='file' className='inputfile' ref="uploadFile"/>
               </div>
             </div>
                </form>
             <div className='row'>
              <div className='small-12 columns' style={{paddingLeft: '50%'}}>
             <button className='button btn' onClick={this.change}>Submit</button>
             </div>
           </div>
       
         </div>
    )
  }
})

module.exports = Import
