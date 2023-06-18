class MissingEnvVarError extends Error {
    constructor(name) {
        super(`Env variable ${name} is missing`);
    }
}

class NullAttributeError extends Error {
    constructor(name) {
        super(`Attribute ${name} cannot be null`);
    }
}

module.exports = {
	MissingEnvVarError,
    NullAttributeError,
}
