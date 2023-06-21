require('./src/lib/string')
//const { GithubBot } = require('./src/platforms/github/githubBot');
const { DoNothingError } = require('./src/error');

ENV_VARIABLES = [
	"OPENAI_API_KEY",
	"MONGODB_URI"
]
check_env_variables(ENV_VARIABLES);

//const githubBot = new GithubBot();

/**
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
    app.log("Yay! The app was loaded!");

    app.on("issues.opened", async (context) => {
        //return await githubBot.newIssue(context);
		return context.octokit.issues.createComment(
			context.issue({ body: "New issue" })
		);
    });

    app.on("issues.edited", async (context) => {
        try {
            //return await githubBot.issueEdited(context);
			return context.octokit.issues.createComment(
				context.issue({ body: "Issue edited" })
			);
        }
        catch (e) {
            if (e instanceof DoNothingError) {
                //Do nothing
                console.log("Do nothing");
            }
            else {
                throw e;
            }
        }
    })
};


function check_env_variables(env_vars){
	for(let env_var of env_vars) {
		if(! (env_var in process.env)) {
			throw new Error(`Environment variable ${env_var} is missing`);
		}
	}
}
