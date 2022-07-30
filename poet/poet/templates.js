const
  { marked, Renderer } = require('marked'),
  renderer = new Renderer(),
  pug = require('pug').compile;

renderer.heading = function(text, level) {
	return `<h${level}>${text}</h${level}>\n`;
};

// Configure defaults for marked to keep compatibility
marked.setOptions({
  renderer: renderer,
  pedantic: true
});

module.exports = {
  templates: {
    pug: (options) => pug(options.source, {filename: options.filename})(options.locals),
    markdown: (options) => marked.parse(options.source),
    md: (options) => marked.parse(options.source)
  },
  templateEngines: {
    marked,
    pug
  }
};
