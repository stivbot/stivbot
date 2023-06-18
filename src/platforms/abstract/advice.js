const { NullAttributeError } = require('../../errors/errors')

class Advice {
    constructor(instruction, body = null) {
        if (instruction == null) {
            throw new NullAttributeError("instruction");
        }

        this.instruction = instruction;
        this.body = body;
    }

    toMarkdown() {
        var markdown = "### Advice\n{0}\n".format(this.instruction);

        if (this.body != null) {
            markdown += "> {0}\n".format(this.body.replaceAll('\n', '\n> '));
        }

        return markdown;
    }
}

module.exports = {
    Advice
}