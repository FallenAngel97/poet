import { marked, Renderer } from 'marked';
const renderer = new Renderer();
import { compile as pug, LocalsObject } from 'pug';

renderer.heading = function(text: string, level: 1 | 2 | 3 | 4 | 5 | 6) {
	return `<h${level}>${text}</h${level}>\n`;
};

// Configure defaults for marked to keep compatibility
marked.setOptions({
  renderer: renderer
});

export type TemplateOptions = {
  source: string;
  filename: string;
  locals: LocalsObject;
}

export default {
  templates: {
    pug: (options: TemplateOptions) => pug(options.source, {filename: options.filename})(options.locals),
    markdown: (options: TemplateOptions) => marked.parse(options.source),
    md: (options: TemplateOptions) => marked.parse(options.source)
  },
  templateEngines: {
    marked,
    pug
  }
};
