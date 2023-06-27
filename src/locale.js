const path = require('path');
const PropertiesReader = require('properties-reader');

module.exports = LOCALE = {
	GITHUB: PropertiesReader(path.join(process.cwd(), 'static/properties/github.properties')),
	ABSTRACT: PropertiesReader(path.join(process.cwd(), 'static/properties/abstract.properties'))
};
