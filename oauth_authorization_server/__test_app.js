

var oauth2_lib = require('./oauth2_lib').oauth2_lib

var myOAP = new oauth2_lib({crypt_key: 'encryption secret', sign_key: 'signing secret'})



a = myOAP.generateAccessToken("AA", "BB", "CC", "DD")
b = myOAP.parseAccessToken(a)

console.log(a)
console.log(b)


v = myOAP.validateToken(a, "AA", "BB", "CC", "DD")
console.log(v)


r = myOAP.refreshToken(a)
console.log(r)

b = myOAP.parseAccessToken(r)
console.log(b)