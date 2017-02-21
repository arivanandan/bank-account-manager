const React = require('react')
const {postJSON} = require('io-square-browser')

const Logout = React.createClass({
  componentWillMount: function () {
    postJSON('/logout', {}).then((response) => {
      console.log('logout')
    })
  },
  render: function () {
    return (
      <div>
        <h3>You are successfully logged out</h3>
      </div>
    )
  }
})

module.exports = Logout
