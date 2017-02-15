module.exports = () => {
  const fs = require('fs')
  const files = fs.readdirSync('/home/progr/Desktop/bank-account-manager/uploads/')
  const obj = fs.readFileSync('/home/progr/Desktop/bank-account-manager/uploads/' + files[0], 'utf8').split('\n')
  fs.unlinkSync('/home/progr/Desktop/bank-account-manager/uploads/' + files[0])
  const dateRegex = /^[0-9][0-9]-[0-9][0-9]-[0-9][0-9][0-9][0-9]/
  let counter = 1

  return obj.filter(line => line.match(dateRegex) ? true : false)
              .map(rows => rows.split(',')
              .map(record => record.trim()))
              .map(tuple => {
                tuple.unshift(counter)
                counter++
                return tuple})

}
