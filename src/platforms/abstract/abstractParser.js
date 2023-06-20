const { NullAttributeError } = require('../../error')

class AbstractParser {
    static ID_SEPARATOR = "_"

    constructor(id_prefix) {
        if (id_prefix == null) {
            throw new NullAttributeError("id_prefix");
        }

        this.id_prefix = id_prefix;
    }

    getId(){
        return this.id_prefix.concat(AbstractParser.ID_SEPARATOR);
    }
}

module.exports = {
    AbstractParser
}
