module.exports = () => {
  const xlsx = require('node-xlsx')
  const fs = require('fs')
  let counter = 1
  const files = fs.readdirSync('/home/progr/Desktop/bank-account-manager/uploads/')
  const obj = xlsx.parse('/home/progr/Desktop/bank-account-manager/uploads/' + files[0])[0].data
  fs.unlinkSync('/home/progr/Desktop/bank-account-manager/uploads/' + files[0])

  return data = obj.map(dat => dat
    .map(inDat => inDat.toString(10).trim())
    .map(strDat => strDat.replace(/ /g, '_'))
    .join(' ').trim().split(' ')
  )
  .filter(dat => {
    if (dat[0] == counter) {
      counter ++
      return true
    }
    return false
  })
}
