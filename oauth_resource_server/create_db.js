// https://github.com/typicode/lowdb

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)




db.defaults({ resources: [] })
	.write()


// RESOURCES - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

db.get('resources')
	.push({ 
		owner: "admin", 
		key: "username",
		valore: "admin",
	})
	.write()

db.get('resources')
	.push({ 
		owner: "user", 
		key: "username",
		valore: "user",
	})
	.write()

	


db.get('resources')
	.push({ 
		owner: "admin", 
		key: "protected_resource",
		valore: "admin protected resource here",
	})
	.write()

db.get('resources')
	.push({ 
		owner: "user", 
		key: "protected_resource",
		valore: "user protected resource here",
	})
	.write()

	


