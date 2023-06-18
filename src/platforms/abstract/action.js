const { NullAttributeError } = require('../../error')

class Action {
    constructor(instruction, body = null) {
        if (instruction == null) {
            throw new NullAttributeError("instruction");
        }

        this.instruction = instruction;
        this.body = body;
    }

    toMarkdown() {
        var markdown = "### Action\n{0}\n".format(this.instruction);

        if (this.body != null) {
            markdown += "```markdown\n{0}\n```\n".format(this.body);
        }

        return markdown;
    }
}

module.exports = {
    Action
}
