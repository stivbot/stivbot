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

	PREFIX = "You are a business planning expert. You have helped entrepreneurs to go from an idea to a succesfull business. Your goal is to answer user demands."

	constructor() {
		if(process.env.OPENAI_API_KEY == null || process.env.OPENAI_API_KEY == undefined) {
			throw new Error(`Env variable OPENAI_API_KEY is missing`)
		}

		const configuration = new Configuration({
			apiKey: process.env.OPENAI_API_KEY,
		});
		this.client = new OpenAIApi(configuration);
	}

	reset() {
		this.messages = [{
			"role": ROLE.SYSTEM,
			"content": this.PREFIX,
		}]
	}

	async request(message, reset_chat = true) {
		console.log("Sending request to OpenAI");

		if (reset_chat) {
			this.reset();
		}

		this.messages.push({
			"role": ROLE.USER,
			"content": message,
		});

		let completion = await this.client.createChatCompletion({
			model: this.MODEL,
			messages: this.messages,
			max_tokens: this.MAX_TOKENS,
			stop: this.STOP_PATTERN,
		});

		this.messages.push({
			"role": ROLE.ASSISTANT,
			"content": completion.data.choices[0].message.content,
		});

		return completion.data.choices[0].message.content;
	}
}

module.exports = {
	OpenAi,
	ROLE
}
