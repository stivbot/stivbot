class MissingEnvVarError extends Error {
    constructor(name) {
        super(`Env variable ${name} is missing`);
    }
}

module.exports = {
	MissingEnvVarError,
}
