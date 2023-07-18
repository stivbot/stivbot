const { MongoClient } = require('mongodb');
const { MissingEnvVarError } = require('../error')

class MongoDB {

    static DATABASE_NAME = `stivbot-${process.env.ENV}`;

    constructor() {
		if(process.env.MONGODB_URI == null || process.env.MONGODB_URI == undefined) {
			throw new MissingEnvVarError('MONGODB_URI');
		}
        this.client = new MongoClient(process.env.MONGODB_URI);
    }

    async connect() {
        await this.client.connect();
    }

    async close() {
        await this.client.close();
    }

    async find(collection_name, query) {
        const db = this.client.db(MongoDB.DATABASE_NAME);
        const collection = db.collection(collection_name);
        return await collection.find(query).toArray();
    }

    async upsert(collection_name, query, element) {
        const db = this.client.db(MongoDB.DATABASE_NAME);
        const collection = db.collection(collection_name);
        return await collection.updateOne(query, { $set: element }, { upsert: true });
    }
}

class AbstractConnector {

	static mongodb;

    static {
        AbstractConnector.mongodb = new MongoDB();
        AbstractConnector.mongodb.connect();
    }

    constructor(collection_name, get_function, set_function) {
        this.collection_name = collection_name;
        this.get_function = get_function;
        this.set_function = set_function;
    }

    async get(element) {
        const elements = await AbstractConnector.mongodb.find(this.collection_name, this.get_function(element));
        if (elements.length) {
            return elements[0];
        }
        return null;
    }

    async set(element) {
        return await AbstractConnector.mongodb.upsert(this.collection_name,  this.get_function(element), this.set_function(element));
    }
}

class IdeaConnector extends AbstractConnector {

    static COLLECTION_NAME = "ideas";
    static GET_FUNCTION = (idea) => { return {
        id: idea.id
    }};
    static SET_FUNCTION = (idea) => { return {
        id: idea.id,
        state: idea.next_state
    }};

    constructor() {
        super(IdeaConnector.COLLECTION_NAME, IdeaConnector.GET_FUNCTION, IdeaConnector.SET_FUNCTION);
    }
}

class EventConnector extends AbstractConnector {

    static COLLECTION_NAME = "events";
    static GET_FUNCTION = (event) => { return {
        user: event.user,
        name: event.name,
        date: event.date
    }};
    static SET_FUNCTION = (event) => { return {
        user: event.user,
        name: event.name,
        date: event.date
    }};

    constructor() {
        super(EventConnector.COLLECTION_NAME, EventConnector.GET_FUNCTION, EventConnector.SET_FUNCTION);
    }
}

module.exports = {
	IdeaConnector,
    EventConnector
}
