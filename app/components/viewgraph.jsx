const React = require('react')
const {getJSON} = require('io-square-browser')

const ViewGraph = React.createClass({
  componentWillMount: function () {
      getJSON('/viewGraph').then(response => {
      this.setState({
          data: response
        })
    })
  },
  render: function () {
    if(!this.state){
      return (
        <div className = 'loadingContainer'>
          <img className = 'loadingSpin' src = 'bam.jpeg' />
        </div>
      )
    }
    let [bank1, bank2, bank3] = this.state.data
    let total = 0,
    axis = 0,
    icici = 0,
    federal = 0,
    legend1 = 'none',
    legend2 = 'none',
    legend3 = 'none'

    if (bank1) {
      if (bank1.fromAcc == 'AXIS') {
        axis = bank1.bal + 1
        legend1 = 'block'
      }
      else if (bank1.fromAcc == 'ICICI') {
        icici = bank1.bal + 1
        legend2 = 'block'
      }
      else {
        federal = bank1.bal + 1
        legend3 = 'block'
      }
      total += bank1.bal
    }

    if (bank2) {
      if (bank2.fromAcc == 'ICICI') {
        icici = bank2.bal + 1
        legend2 = 'block'
      }
      else {
        federal = bank2.bal + 1
        legend3 = 'block'
      }
      total += bank2.bal
    }

    if (bank3) {
      federal = bank3.bal + 1
      legend3 = 'block'
      total += bank3.bal
    }


    const one = Math.ceil((axis / total) * 100)
    const two = Math.ceil((icici / total) * 100)
    const three = Math.ceil((federal / total) * 100)
    const oneProp = (one + two + three) + ' 100'
    const twoProp = (two + three) + ' 100'
    const threeProp = three + ' 100'

    return (
      <div>

        <svg viewBox = '0 0 32 32' id = 'graph'>
          <circle r = '16' cx = '16' cy = '16' strokeDasharray = {oneProp}  id = 'circle1'/>
          <circle r = '16' cx = '16' cy = '16' strokeDasharray = {twoProp} id = 'circle2'/>
          <circle r = '16' cx = '16' cy = '16' strokeDasharray = {threeProp} id = 'circle3'/>
        </svg>

        <div id = 'legenDiv'>
          <div style = {{display: legend1}}>
            <svg height = '20' width = '20'>
              <rect width = '20' height = '20' id = 'rect1' />
            </svg>
            Axis
          </div>

          <div style = {{display: legend2}}>
            <svg height = '20' width = '20'>
              <rect width = '20' height = '20' id = 'rect2' />
            </svg>
            ICICI
          </div>

          <div style = {{display: legend3}}>
            <svg height = '20' width = '20'>
              <rect width = '20' height = '20' id = 'rect3' />
            </svg>
            Federal
          </div>
        </div>

      </div>
    )
  }
})

module.exports = ViewGraph
