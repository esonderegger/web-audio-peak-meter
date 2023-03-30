/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs/promises');
const path = require('path');
const http = require('http');
const rollup = require('rollup');
const typescriptPlugin = require('@rollup/plugin-typescript');
const stringPlugin = require('rollup-plugin-string');
const terserPlugin = require('rollup-plugin-terser');
const marked = require('marked');
const jsdom = require('jsdom');
const finalhandler = require('finalhandler');
const serveStatic = require('serve-static');
const chokidar = require('chokidar');

async function buildWorklet(fileName) {
  console.log(`building ${fileName} worklet...`);
  const inputOptions = {
    input: `./src/${fileName}-processor.ts`,
    plugins: [
      typescriptPlugin({
        include: [`./src/${fileName}*.ts`, './src/global.d.ts'],
        exclude: ['node_modules', 'lib', '**/*.test.ts'],
        lib: ['es2016', 'DOM'],
        sourceMap: false,
      }),
      terserPlugin.terser(),
    ],
  };
  const outPath = `./src/${fileName}-processor.txt`;
  const outputOptions = {
    file: outPath,
    format: 'esm',
  };
  const bundle = await rollup.rollup(inputOptions);
  const { output } = await bundle.generate(outputOptions);
  await fs.writeFile(outPath, output[0].code);
  await bundle.close();
  console.log(`${fileName} worklet rebuilt.`);
}

async function buildMain() {
  console.log('building main library...');
  const inputOptions = {
    input: './src/index.ts',
    plugins: [
      stringPlugin.string({
        include: './src/*.txt',
      }),
      typescriptPlugin(),
      terserPlugin.terser(),
    ],
  };
  const version = process.env.npm_package_version;
  const iifeOutput = {
    file: `./docs/web-audio-peak-meter-${version}.min.js`,
    format: 'iife',
    name: 'webAudioPeakMeter',
    exports: 'named',
    sourcemap: true,
  };
  const esmOutput = {
    file: './lib/index.esm.js',
    format: 'esm',
    sourcemap: true,
  };
  const cjsOutput = {
    file: './lib/index.js',
    format: 'cjs',
    sourcemap: true,
  };
  try {
    const bundle = await rollup.rollup(inputOptions);
    await bundle.write(iifeOutput);
    await bundle.write(esmOutput);
    await bundle.write(cjsOutput);
    await bundle.close();
    console.log('Main library rebuilt.');
  } catch (err) {
    console.log(`problem creating bundle: ${err}`);
  }
}
function escapeHtml(unsafe) {
  // console.log(unsafe);
  return unsafe
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function docHtml(content, markup, js) {
  const dom = new jsdom.JSDOM(content);
  const title = dom.window.document.querySelector('h1').textContent;
  const version = process.env.npm_package_version;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link href="/web-audio-peak-meter/docs.css" rel="stylesheet">
</head>
<body>
${content}
${
  markup
    ? `<h2>Working Example</h2>
${markup}
<h2>HTML code</h2>
<pre class="code-block"><code>${escapeHtml(markup)}</code></pre>`
    : ''
}
${
  js
    ? `<h2>Javascript code</h2>
<pre class="code-block"><code>${escapeHtml(js)}</code></pre>
<script src="/web-audio-peak-meter/web-audio-peak-meter-${version}.min.js"></script>
<script>
${js}
</script>`
    : ''
}
</body>
</html>
`;
}

async function buildDocExample(mdFile) {
  const contents = await fs.readFile(path.join('examples', mdFile));
  const { name } = path.parse(mdFile);
  const htmlFile = `${name}.html`;
  const htmlContents = await fs.readFile(path.join('examples', htmlFile));
  const jsFile = `${name}.js`;
  const jsContents = await fs.readFile(path.join('examples', jsFile));
  const markup = marked.marked(contents.toString(), { smartypants: true });
  const fullHtml = docHtml(markup, htmlContents, jsContents);
  await fs.writeFile(path.join('docs', 'examples', `${name}.html`), fullHtml);
}

async function buildDocs() {
  const examples = await fs.readdir('examples');
  const mds = examples.filter((ex) => ex.endsWith('.md'));
  await Promise.all(mds.map(buildDocExample));
  const readme = await fs.readFile('README.md');
  const readmeHtml = marked.marked(readme.toString(), { smartypants: true });
  const subbed = readmeHtml.replace(/https:\/\/esonderegger.github.io/g, '');
  const readmeDoc = docHtml(subbed);
  await fs.writeFile(path.join('docs', 'index.html'), readmeDoc);
  console.log('Docs rebuilt.');
}

async function buildAll() {
  await buildWorklet('peak-sample');
  await buildWorklet('true-peak');
  await buildMain();
  await buildDocs();
}

async function localDev() {
  await buildAll();
  const port = process.env.PORT || 6080;
  const serve = serveStatic('./docs');
  const server = http.createServer((req, res) => {
    if (req.url.length < '/web-audio-peak-meter'.length) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('404: File not found');
      return;
    }
    req.url = req.url.slice('/web-audio-peak-meter'.length);
    const done = finalhandler(req, res);
    serve(req, res, done);
  });
  const watcher = chokidar.watch(['./src', './examples']);
  watcher.on('change', (filePath) => {
    if (filePath.includes('peak-sample') && filePath.endsWith('.ts')) {
      buildWorklet('peak-sample');
    } else if (filePath.includes('true-peak') && filePath.endsWith('.ts')) {
      buildWorklet('true-peak');
    } else if (filePath.startsWith('examples/')) {
      buildDocs();
    } else {
      buildMain();
    }
  });
  server.listen(port);
  console.log(`Now serving at http://localhost:${port}`);
  process.on('SIGINT', async () => {
    console.log('Stopping local server and watchers...');
    await server.close();
    await watcher.close();
    console.log('Local server and watchers have been stopped');
  });
}

if (require.main === module) {
  if (process.argv.length > 2 && process.argv[2] === 'dev') {
    localDev();
  } else {
    buildAll();
  }
}
