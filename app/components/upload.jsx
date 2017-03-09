const React = require('react')
const {hashHistory} = require('react-router')

const Upload = React.createClass({
  getInitialState(){
    return({
      bank: 'select',
      filetype: 'select'
    })
  },
  change: function () {
    if (!this.refs.uploadFile.value) {
      alert('Please upload a file.')
    }
    if (!this.state.submit) {
      this.refs.form1.submit()
      // hashHistory.push('/')
    }
  },
  checkFileType: function () {
    if (this.refs.bank.value === 'select' || this.refs.fType.value === 'select') {
      alert('Please choose the Bank & File Type before uploading.')
      this.setState({
          submit: false
        })
    }
    else if (!((this.refs.uploadFile.value).substr(-3) === this.refs.fType.value)) {
      this.setState({
          submit: true
        })
        alert('File type selected does not match with the uploaded file.')
    } else {
      this.setState({
          submit: false
        })
    }
  },
  checkInputs: function () {
    if (this.refs.bank.value === 'select' || this.refs.fType.value === 'select') {
      this.setState({
        uplButton: true
      })
    } else {
      this.setState({
        uplButton: false
      })
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
               <select name='bank' ref = 'bank' onChange={e => this.setState({bank: e.target.value})}>
                 <option value='select' disabled selected>Choose bank</option>
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
               <select name='filetype' ref = 'fType' onChange={e => this.setState({filetype: e.target.value})}>>
                 <option value = 'select' disabled selected>Choose file type</option>
                 <option value='csv'>CSV</option>
                 <option value='xls'>XLS</option>
               </select>
             </div>
             </div>
             <div className='row'>
              <div className='small-12 columns' style={{paddingLeft: '40%'}}>
                 <input type='file' name= 'upl' id='file' className='inputfile' ref="uploadFile" onChange = {this.checkFileType} onMouseOver = {this.checkInputs} disabled = {this.state.uplButton}/>
               </div>
             </div>
                </form>
             <div className='row'>
              <div className='small-12 columns' style={{paddingLeft: '50%'}}>
                <button className='button btn' onClick={this.change} onMouseOver = {this.checkFileType} disabled = {this.state.submit}>Submit</button>
             </div>
           </div>
         </div>
    )
  }
})

module.exports = Upload
