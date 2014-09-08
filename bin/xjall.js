#!/usr/bin/env node

// Load required modules
var fs        = require('fs');
var path      = require('path');
var commander = require('commander');
var stream    = require('stream');

// Node 0.8 fallback
if (!stream.Transform) {
    stream = require('readable-stream');
}

var filelimit = 200;

function list(str) {
    return str.split(',');
}

function log(message) {
    if (commander.verbose) {
        console.log(message);
    }
}

// ## The parser
// parses input files for occurences of function calls to
// the localize function
function parseFun (string, fun) {
    /* jshint esnext: true */
    const states = {
        INIT            : 0,
        F_START         : 1,
        F_ARG_START     : 2,
        F_ARG           : 3,
        F_ARG_STR       : 4,
        F_ARG_END       : 5
    };
    var state  = states.F_START;
    var buffer = '';
    var quote  = '';
    var braces = 0;
    var args   = [];
    var final  = [];

    var start  = string.indexOf(fun);
    if (start === -1){
        return final;
    } else {
        start += fun.length;
    }
    for (var i = start; i < string.length; i++) {
        var c = string[i];
        /*jshint -W086 */
        switch (state)
        {
            // Finding first match
            case states.INIT:
                start = string.indexOf(fun);
                if (start === -1){
                    return final;
                }
                i = start + fun.length - 1;
                state = states.F_START;
                break;

            // Beginning to parse, expecting '(' or whitespace
            case states.F_START:
                if (c === '('){
                    state = states.F_ARG_START;
                } else if (c !== ' ' || c !== '\t'){
                    buffer = '';
                }
                break;

            // Expecting function param start
            case states.F_ARG_START:
                if (c !== ' ' && c !== '\t'){
                    state = states.F_ARG;
                    /* falls through */
                } else {
                    break;
                }

            // Expecting function param
            case states.F_ARG:
                if (c === '('){
                    braces++;
                    break;
                } else if (c === ')' || c === ','){
                    state = states.F_ARG_END;
                    /* falls through */
                } else if (c === '"' || c === '\'') {
                    state = states.F_ARG_STR;
                    quote = c;
                    break;
                } else if (c === ' ' || c === '\t') {
                    state = states.F_ARG_END;
                    break;
                } else {
                    buffer += c;
                    break;
                }

            // Expecting end of arg (,)
            case states.F_ARG_END:
                if (c === ','){
                    if (quote.length === 1){
                        quote = '';
                        args.push({ string : true, value : buffer});
                    } else {
                        args.push({ string : false, value : buffer});
                    }
                    buffer = '';
                    state = states.F_ARG_START;
                } else if (c === ')'){
                    if (braces > 0){
                        braces--;
                    } else {
                        // Function complete
                        if (quote.length === 1){
                            quote = '';
                            args.push({ string : true, value : buffer});
                        } else {
                            args.push({ string : false, value : buffer});
                        }
                        final.push(args);
                        // Re-initiate parser
                        string = string.substring(++i);
                        state  = states.INIT;
                        buffer = '';
                        args   = [];
                        i      = 0;
                    }
                } else if (c !== ' ' && c !== '\t') {
                    state = states.INIT;
                    string = string.substring(i);
                }
                break;

            // Expecting string or end of string
            case states.F_ARG_STR:
                if (c === quote){
                    // End of string
                    state = states.F_ARG_END;
                } else if (c === '\\') {
                    buffer += string[++i];
                } else {
                    buffer += c;
                }
                break;
        }
        /*jshint +W086 */
    }
    return final;
}

// Setup the argument parser and the options
commander
    .version(require('../package.json').version)
    .option('-r, --recursive', 'Set xlocalize to generate translations.json files recursively (default: true)', true)
    .option('-R, --no-recursive', 'Set xlocalize to generate a translations.json file for the current directory')
    .option('-e, --extensions <exts>', 'Set the file extensions to include for translation (default: html,js)', list, ['html', 'js'])
    .option('-t, --translate-to <langs>', 'Set the languages to translate to (comma separated)', list, [])
    .option('-o, --output-path <path>', 'Put the translations.json only in specified output directory')
    .option('-v, --verbose', 'Verbose output (default: false)', false)
    .option('-f, --function-name <name>', 'Set the translation function name (default: translate)', 'translate')
    .parse(process.argv);


function readAndParse(filename, cb) {
    var funs = [];
    var liner = new stream.Transform( { objectMode: true } );
    liner._transform = function (chunk, encoding, done) {
        var data = chunk.toString();
        if (this._lastLineData)
            data = this._lastLineData + data;
        var lines = data.split('\n');
        this._lastLineData = lines.splice(lines.length-1,1)[0];
        lines.forEach(this.push.bind(this));
        done();
    };
     
    liner._flush = function (done) {
        if (this._lastLineData)
            this.push(this._lastLineData);
        this._lastLineData = null;
        done();
    };

    if (filelimit === 0){
        process.nextTick(function () {
            readAndParse(filename, cb);
        });
        return;
    }
    filelimit--;
    var filestream = fs.createReadStream(filename);
    filestream.pipe(liner);
    liner.on('readable', function () {
        var line;
        /*jshint -W084 */
        while (line = liner.read()) {
            funs = funs.concat(parseFun(line, commander.functionName));
        }
        /*jshint +W084 */
    });
    liner.on('end', function () {
        if (cb){
            filelimit++;
            cb(funs);
        }
    });
}

// ## The *processFile* function
// extracts all translatable pieces of a source file into the dirJSON object,
// unless already there.
function processFile (filename, dirJSON, cb) {
    // Do not process itself
    if (filename === __filename) {
        log('Skipping ' + filename);
        if (cb){
            cb(dirJSON);
        }
        return;
    }

    // Process files
    log('Processing ' + filename + '...');
    readAndParse(filename, cb);
}

// ## The *processDir* function
// generates a ``translations.json`` file for the current directory, but does
// not override the previous file -- only augments it
function processDir(dir) {
    // JSON object for the current directory
    var dirJSON = {};
    var translations;
    // Path where translations will go
    if (commander.outputPath){
        translations = path.join(commander.outputPath, "translations.json");
    } else {
        translations = path.join(dir, "translations.json");
    }
    // Check for pre-existing ``translations.json`` file
    
    if(fs.existsSync(translations)) {
        var currJSON = JSON.parse(fs.readFileSync(translations, "utf8"));
        dirJSON = currJSON;
    }

    // Process files in the current directory
    var files = fs.readdirSync(dir);
    files.forEach(function(file) {
        var fileExt = '';
        var i = file.lastIndexOf('.');
        if (i !== -1){
            fileExt = file.substring(i + 1);
        }
        if(fs.statSync(path.join(dir, file)).isFile() && (commander.extensions.indexOf(fileExt) !== -1)) {
            processFile(path.join(dir, file), dirJSON, function(funs){
                if(fs.existsSync(translations)) {
                    var currJSON = JSON.parse(fs.readFileSync(translations, "utf8"));
                    dirJSON = currJSON;
                }
                if(funs) {
                    /* jshint loopfunc: true */
                    for(var i = 0; i < funs.length; i++) {
                        var args = funs[i];
                        if (args.length === 0)
                            continue;
                        if (args[0].string){
                            var s = args[0].value;
                            if(!dirJSON[s]) { // Does not yet exist
                                dirJSON[s] = {};
                            }
                            commander.translateTo.forEach(function(lang) {
                                if(!dirJSON[s][lang]) { // No translation, yet
                                    dirJSON[s][lang] = "MISSING TRANSLATION FOR: " + s;
                                }
                            });
                        } else {
                            var translateMessage = "FOUND VARIABLE INPUT: " + args[0];
                            dirJSON[translateMessage] = {};
                            commander.translateTo.forEach(function(lang) {
                                dirJSON[translateMessage][lang] = "MISSING TRANSLATION FOR: " + translateMessage;
                            });
                        }
                    }
                }
                fs.writeFileSync(translations, JSON.stringify(dirJSON, null, "  "), "utf8");
            });
        }
        if(commander.recursive && fs.statSync(path.join(dir, file)).isDirectory() && file !== '.git') {
            // Output dirJSON to file
            processDir(path.join(dir, file));
        }
    });
}

// Check if dir exists
if (commander.outputPath && !fs.existsSync(commander.outputPath)) {
    fs.mkdirSync(commander.outputPath);
}

// Get the ball rollin'
processDir(process.cwd());
