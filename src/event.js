const { EventConnector } = require('./lib/mongodb.js')

class Event {

    constructor(user, name, date) {
		this.user = user;
		this.name = name;
		this.date = date;
	}

	async save(){
		await new EventConnector().set(this);
	}
}

module.exports = {
	Event
}
