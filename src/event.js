const { EventConnector } = require('./lib/mongodb.js')

class Event {

    constructor(user, name, date) {
		this.user = user;
		this.name = name;
		this.date = date;
	}

	async save(){
		await new EventConnector().set(this);
		console.log(`Event logged with timestamp ${this.date}`);
	}
}

module.exports = {
	Event
}
