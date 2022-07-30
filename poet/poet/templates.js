const
  markdown = require('marked'),
  renderer = new markdown.Renderer(),
  pug = require('pug').compile;

renderer.heading = function(text, level) {
	return `<h${level}>${text}</h${level}>\n`;
};

// Configure defaults for marked to keep compatibility
markdown.setOptions({
  renderer: renderer,
  pedantic: true
});

module.exports = {
  templates: {
    pug: (options) => pug(options.source, {filename: options.filename})(options.locals),
    markdown: (options) => markdown(options.source),
    md: (options) => markdown(options.source)
  },
  templateEngines: {
    marked: markdown,
    pug
  }
};
