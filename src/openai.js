const { Configuration, OpenAIApi } = require("openai");

class OpenAi {

	MODEL = "gpt-3.5-turbo"
	MAX_TOKENS = 1000
	STOP_PATTERN = ['<|im_end|>']

	PREFIX = "You are a business planning expert. You have helped entrepreneurs to go from an idea to a succesfull business. Your goal is to answer user demands."

	constructor(api_key) {
		const configuration = new Configuration({
			api_key,
		});
		this.client = new OpenAIApi(configuration);
	}

	async request(discussionId, message) {
		console.log("Sending request to OpenAI with discussion " + discussionId);

		return await this.client.createChatCompletion({
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
			//stop: this.STOP_PATTERN,
		});
	}
}

module.exports = {
	OpenAi,
}
