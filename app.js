const { Bot } = require('./src/bot.js');

ENV_VARIABLES = [
	"OPENAI_API_KEY"
]
check_env_variables(ENV_VARIABLES);

const chatBot = new Bot();

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
    app.log("Yay! The app was loaded!");

    app.on("issues.opened", async (context) => {
        return await chatBot.newIssue(context);
    });

    app.on("issues.edited", async (context) => {
        //If help required
        return await chatBot.issueEdited(context);
    })
};


function check_env_variables(env_vars){
	for(let env_var of env_vars) {
		if(! (env_var in process.env)) {
			throw new Error(`Environment variable ${env_var} is missing`);
		}
	}
}