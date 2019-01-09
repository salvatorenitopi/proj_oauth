// https://github.com/typicode/lowdb

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

/*	CREAZIONE

// Set some defaults (required if your JSON file is empty)
db.defaults({ posts: [], user: {}, count: 0 })
	.write()

// Add a post
db.get('posts')
	.push({ id: 1, title: 'lowdb is awesome'})
	.write()

// Set a user using Lodash shorthand syntax
db.set('user.name', 'typicode')
	.write()
  
// Increment count
db.update('count', n => n + 1)
	.write()

/*

// QUERY RICERCA - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

/*
console.log(				// Prendi l'elemento che ha id: 1 in "posts"
	db.get('posts')
	.find({ id: 1 })
	.value()
)
*/

/*
console.log(				// Prendi gli elementi con title: 'lowdb is awesome' in "posts"
	db.get('posts')
	.filter({ title: 'lowdb is awesome' })
	.value()
)
*/

/*
console.log(				// Prendi gli elementi con title: 'lowdb is awesome' e id: 1 in "posts"
	db.get('posts')
	.filter({ title: 'lowdb is awesome' })
	.find({ id: 1 })
	.value()
)
/*


// QUERY UPDATE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

/*
db.get('posts')
  .find({ title: 'low!' })
  .assign({ title: 'hi!'})
  .write()
 */
 

// QUERY DELETE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

/*
db.get('posts')
  .remove({ title: 'low!' })
  .write()
*/