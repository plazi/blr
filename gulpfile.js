const { series, parallel, src, dest } = require('gulp');
const htmlReplace = require('gulp-html-replace');
const inject = require('gulp-inject-string');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const { rollup } = require('rollup');
const { terser } = require('rollup-plugin-terser');
const rm = require('gulp-rm');
const fs = require('fs');

const d = new Date();
const dsecs = d.getTime();
const projectName = 'blr';
const source = '.';
const destination = './docs';

// remove old css and js
async function cleanup() {
    console.log('cleaing up old files');

    const js = fs.readdirSync(`${destination}/js`)
        .map(f => `${destination}/js/${f}`);

    const css = fs.readdirSync(`${destination}/css`)
        .map(f => `${destination}/css/${f}`);

    const oldFiles = [...js, ...css];
    if (oldFiles.length) {
        return src(oldFiles, { read: false }).pipe( rm() );
    }
}

// generate the html
async function html() {
    console.log('writing html');

    return src(`${source}/index.html`)
        .pipe(inject.replace('%date%', d))
        //.pipe(inject.replace('%dsecs%', dsecs))
        .pipe(inject.replace(
            `./js/main.js`, 
            `./js/main-${dsecs}.js`
        ))
        .pipe(htmlReplace({
            'css': `./css/styles-${dsecs}.css`
        }))
        .pipe(dest(destination))
}

async function makeCopiesOfIndex() {
    function copyIndex(file) {
        console.log(`creating ${file}.html`);
    
        return src(`${destination}/index.html`)
            .pipe(rename(`${file}.html`))
            .pipe(dest(destination))
    }

    [ 'apis', 'about', 'liberating-data', 'how-blr-works', 'contribute', 'blog' ].forEach(f => copyIndex(f))
}

// for css
async function css() {
    console.log('processing css');
    
    const files = [
        'typesafe',
        'menu',
        'blr',
        'records',
        'db',
        'db-tiles',
        'db-maps',
        'db-charts',
        'carousel'
    ];

    if (files.length) {
        const css = files.map(f => `${source}/css/${f}.css`);
        return src(css)
            .pipe(cleanCSS({compatibility: 'ie8'}))
            .pipe(concat(`styles-${dsecs}.css`))
            .pipe(dest(`${destination}/css`))
    }
}

// rollup js
async function js() {
    console.log('rolling up the js');

    const bundle = await rollup({
        input: `${source}/js/main.js`
    });

    return bundle.write({
        file: `${destination}/js/main-${dsecs}.js`,
        format: "esm",
        plugins: [
            terser({
                format: {
                    preamble: `/* generated: ${d} */`
                }
            })
        ]
    });
}

exports.default = series(cleanup, parallel(css, js, html), makeCopiesOfIndex)