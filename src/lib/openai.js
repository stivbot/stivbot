const { Configuration, OpenAIApi } = require("openai");

const ROLE = {
	SYSTEM: "system",
	USER: "user",
	ASSISTANT: "assistant"
}

class OpenAi {

	MODEL = "gpt-3.5-turbo"
	MAX_TOKENS = 1000
	STOP_PATTERN = ['<|im_end|>']

	constructor() {
		if(process.env.OPENAI_API_KEY == null || process.env.OPENAI_API_KEY == undefined) {
			throw new Error(`Env variable OPENAI_API_KEY is missing`)
		}

		const configuration = new Configuration({
			apiKey: process.env.OPENAI_API_KEY,
		});
		this.client = new OpenAIApi(configuration);
	}

	async request(message, conversation = new Conversation()) {
		console.log("Sending request to OpenAI");

		conversation.addUserMessage(message);

		let completion = await this.client.createChatCompletion({
			model: this.MODEL,
			messages: conversation.messages,
			max_tokens: this.MAX_TOKENS,
			stop: this.STOP_PATTERN,
		});

		conversation.addAssistantMessage(completion.data.choices[0].message.content);
		return conversation;
	}
}

class Conversation {

	static PREFIX = "You are a business planning expert. You have helped entrepreneurs to go from an idea to a succesfull business. Your goal is to answer user demands."

	constructor() {
		this.messages = [];
		this.#addMessage(ROLE.SYSTEM, Conversation.PREFIX)
	}

	#addMessage(role, content) {
		this.messages.push({
			role,
			content,
		});
	}

	addUserMessage(content) {
		this.#addMessage(ROLE.USER, content);
	}

	addAssistantMessage(content) {
		this.#addMessage(ROLE.ASSISTANT, content);
	}

	getLastMessage(){
		return this.messages[this.messages.length - 1].content;
	}
}

module.exports = {
	OpenAi,
	ROLE
}
