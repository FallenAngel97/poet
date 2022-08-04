import { marked, Renderer } from 'marked';
const renderer = new Renderer();
import { compile as pug } from 'pug';

renderer.heading = function(text, level) {
	return `<h${level}>${text}</h${level}>\n`;
};

// Configure defaults for marked to keep compatibility
marked.setOptions({
  renderer: renderer
});

export default {
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
