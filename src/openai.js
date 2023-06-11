const { Configuration, OpenAIApi } = require("openai");

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

	async request(message) {
		console.log("Sending request to OpenAI");

		let completion = await this.client.createChatCompletion({
			model: this.MODEL,
			messages: [
				{
					"role": "system",
					"content": this.PREFIX,
				},
				{
					"role": "user",
					"content": message,
				}
			],
			max_tokens: this.MAX_TOKENS,
			stop: this.STOP_PATTERN,
		});
		return completion.data.choices[0].message.content;
	}
}

module.exports = {
	OpenAi,
}
