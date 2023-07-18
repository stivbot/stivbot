require('./src/lib/string')
const { GithubBot } = require('./src/platforms/github/githubBot');
const { DoNothingError } = require('./src/error');

ENV_VARIABLES = [
    "ENV",
	"OPENAI_API_KEY",
	"MONGODB_URI"
]
check_env_variables(ENV_VARIABLES);

const githubBot = new GithubBot();

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
    app.log("Loading the app...");

    githubBot.bind(app);

    app.log("Loaded!");
};


function check_env_variables(env_vars){
	for(let env_var of env_vars) {
		if(! (env_var in process.env)) {
			throw new Error(`Environment variable ${env_var} is missing`);
		}
	}
}
