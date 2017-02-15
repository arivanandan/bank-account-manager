const React = require('react')
const Nav = require('Nav')

const Main = React.createClass({
  render: function () {
    return (
      <div>
        <Nav/>
      <div className='row'>
        <div className='coloumns medium-6 large-9 small-centered main'>
            {this.props.children}
        </div>
      </div>
      </div>
    )
  }
})

module.exports = Main
