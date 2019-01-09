// https://github.com/typicode/lowdb

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)




db.defaults({ users: [], authorizations: [], codes: [], applications: [] })
	.write()


// USERS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

db.get('users')
	.push({ 
		username: "admin", 
		password: '812c9ab3d3c118767d7c010ae2b2de48136945e02ae37254b7db1267acc8b56b52e681ef5f0a6f76a4f849ea06f57b1bb60f685fef73a29598ce218f21a554a7',
		email: "admin@example.com"
	})
	.write()


db.get('users')
	.push({ 
		username: "user", 
		password: '626b9989f5b3760be6c884cc94e5388910ca8eb84113c9ce32ebc924c03952f26aa00fd4871147766b45c4add9a09c52570af18f7f01086a201742ebcc32e874',
		email: "user@example.com"
	})
	.write()



// APPLICATIONS - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

// authorization_code
// implicit
// password
// client_credentials

db.get('applications')
	.push({
		owner: "admin",
		grant_type: "authorization_code",
		client_id: "11111111",
		client_secret: "62670d1e1eea06b6c975e12bc8a16131b278f6d7bcbe017b65f854c58476baba86c2082b259fd0c1310935b365dc40f609971b6810b065e528b0b60119e69f61",
		client_name: "APP PROVA - authorization_code"
	})
	.write()


db.get('applications')
	.push({
		owner: "admin",
		grant_type: "implicit",
		client_id: "22222222",
		client_secret: "1f86c769b319d953ab017153897f602b2fac6b73b4e64bf942085bd03c414c203c9030d47f33b937c9a3e30ed3764cf60eecbfd4e2284b736302fa837f8751c4",
		client_name: "APP PROVA - implicit"
	})
	.write()


db.get('applications')
	.push({
		owner: "admin",
		grant_type: "password",
		client_id: "33333333",
		client_secret: "733c8373edc5d58c828d4050aa493529731547eeed2bb9c3ca57da790c61171446adf27ee828e7337791b59a91dff30e9de1ce878b725dc8a4622e1e68c63f07",
		client_name: "APP PROVA - password"
	})
	.write()


db.get('applications')
	.push({
		owner: "admin",
		grant_type: "client_credentials",
		client_id: "44444444",
		client_secret: "b8474ff280f9a804057ce0b5055919345244f0abe0184a583d903fec09786913011ede0bd7b753b1866b1dc85bbfccf6844f49721f5dec27e506e5c5d2ffc216",
		client_name: "APP PROVA - client_credentials"
	})
	.write()
