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

class DoNothingError extends Error {
    constructor(reason) {
        super(`Nothing to do for the following reason: ${reason}`);
    }
}

module.exports = {
	MissingEnvVarError,
    NullAttributeError,
    DoNothingError,
}
