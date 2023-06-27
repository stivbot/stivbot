const { NullAttributeError } = require('../../error')
require('../../lib/string')

class Answer {
    constructor(title, body, instructions, quote = null, code = null) {
        if (title == null) {
            throw new NullAttributeError("title");
        }
        if (body == null) {
            throw new NullAttributeError("body");
        }
        if (instructions == null) {
            throw new NullAttributeError("instructions");
        }

        this.title = title;
        this.body = body;
        this.instructions = instructions;
        this.quote = quote;
        this.code = code;
    }

    toMarkdown() {
        var markdown = "# {0}\n\n{1}\n\n### Instructions\n\n{2}\n\n".format(this.title, this.body, this.instructions);

        if (this.quote != null) {
            markdown += "> {0}\n\n".format(this.quote.replaceAll('\n', '\n> '));
        }
        if (this.code != null) {
            markdown += "<details>\n<summary>Markdown</summary>\n\n```markdown\n\n{0}\n```\n</details>".format(this.code);
        }

        return markdown;
    }
}

module.exports = {
    Answer
}
