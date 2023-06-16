const { MongoClient } = require('mongodb');
const { MissingEnvVarError } = require('./errors/missingEnvVarError.js')

class MongoDB {

    static DATABASE_NAME = "ideal"

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

    async insert(collection_name, element) {
        const db = this.client.db(MongoDB.DATABASE_NAME);
        const collection = db.collection(collection_name);
        return await collection.insert([element]);
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
        return await this.mongodb.insert(this.collection_name,  this.set_function(element));
    }
}

class IdeaConnector extends AbstractConnector {

    static COLLECTION_NAME = "ideas";
    static GET_FUNCTION = (id) => { return {
        id: id
    }};
    static SET_FUNCTION = (idea) => { return {
        id: idea.id,
        state: idea.state
    }};

    constructor() {
        super(IdeaConnector.COLLECTION_NAME, IdeaConnector.GET_FUNCTION, IdeaConnector.SET_FUNCTION);
    }
}

module.exports = {
	IdeaConnector,
}
