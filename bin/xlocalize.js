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

var counter = 0;

var liner = new stream.Transform( { objectMode: true } )

liner._transform = function (chunk, encoding, done) {
    var data = chunk.toString()
    if (this._lastLineData)
        data = this._lastLineData + data
    var lines = data.split('\n')
    this._lastLineData = lines.splice(lines.length-1,1)[0]
    lines.forEach(this.push.bind(this))
    done()
}
 
liner._flush = function (done) {
    if (this._lastLineData)
        this.push(this._lastLineData)
    this._lastLineData = null
    done()
}

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
    const states = {
        INIT            : 0,
        F_START         : 1,
        F_ARG_START     : 2,
        F_ARG           : 3,
        F_ARG_STR       : 4,
        F_ARG_END       : 5
    }
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
        c = string[i];
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
                state = states.F_ARG; /* fall through */
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
                /* fall through */
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
    }
    return final;
}

// Setup the argument parser and the options
commander
    .version(require('../package.json').version)
    .option('-l, --language <lang>', 'Set the default language for the translations.json file(s) (default: en)', 'en')
    .option('-r, --recursive', 'Set xlocalize to generate translations.json files recursively (default: true)', true)
    .option('-R, --no-recursive', 'Set xlocalize to generate a translations.json file for the current directory')
    .option('-e, --extensions <exts>', 'Set the file extensions to include for translation (default: html,js)', list, ['html', 'js'])
    .option('-t, --translate-to <langs>', 'Set the languages to translate to (comma separated)', list, [])
    .option('-o, --output-dir <dir>', 'Set the output directory for the translations.json file(s) (default: current dir)', process.cwd())
    .option('-v, --verbose', 'Verbose output (default: false)', false)
    .option('--function-name <name>', 'Set the translation function name (default: translate)', 'translate')
    .parse(process.argv);

// ## The *mergeObjs* function
// is a helper function that clones the value of various object into a new one.
// This simplistic one is fast, but assumes no recursive objects to merge.
function mergeObjs() {
    var outObj = {};
    for(var i in arguments) {
        if(arguments[i] instanceof Object) {
            /* jshint forin: false */
            for(var j in arguments[i]) {
                // Does not check for collisions, newer object
                // definitions clobber old definitions
                outObj[j] = arguments[i][j];
            }
        }
    }
    return outObj;
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

    var funs = [];

    // Process files
    log('Processing ' + filename + '...');
    var filestream = fs.createReadStream(filename);
    filestream.pipe(liner);
    liner.on('readable', function () {
        var line
        while (line = liner.read()) {
            funs = funs.concat(parseFun(line, commander.functionName));
        }
    });
    liner.on('end', function () {
        console.log(funs);
        if(funs) {
            /* jshint loopfunc: true */
            for(var i = 0; i < funs.length; i++) {
                var args = funs[i];
                console.log("ARGS: ");
                console.log(args[0].string);
                if (args.length === 0)
                    continue;
                if (args[0].string){
                    var s = args[0].value;
                    if(!dirJSON[s]) { // Does not yet exist
                        dirJSON[s] = {};
                    }
                    commander.translateTo.forEach(function(lang) {
                        if(!dirJSON[s][lang]) { // No translation, yet
                            dirJSON[s][lang] = "MISSING TRANSLATION";
                        }
                    });
                } else {
                    // FIXME !!!
                    // Detect if string or variable
                    // If variable: "FOUND VARIABLE INPUT: "
                    // If String and vars: String as key, var placeholders in transl.
                    var translateMessage = "FOUND VARIABLE INPUT: " + args[0];
                    /*
                    for (var j = 1; j <= funs[i].length; j++) {
                        var el = funs[i][j];
                        translateMessage += "$[" + j + "] " + "(" + el + ")";
                    };
                    */
                    dirJSON[translateMessage] = {};
                    commander.translateTo.forEach(function(lang) {
                        dirJSON[translateMessage][lang] = "MISSING TRANSLATION";
                    });
                }
            }
        }
        if (cb){
            cb(dirJSON);
        }
    });
    //console.log(funs);
    /*
    if (translatables) {
        jshint loopfunc: true 
        for (var i = 0; i < translatables.length; i++) {
            var trans_arr = translatables[i];
        };
    }
    */
}

// ## The *processFile* function
// extracts all translatable pieces of a source file into the dirJSON object,
// unless already there.
/*
function processFile(filename, dirJSON) {
    // Check that we don't localize ourselves
    if (filename == __filename) {
        log('Skipping ' + filename);
        return;
    }
    log('Processing ' + filename + '...');
    // Hacky, hacky RegExp parsing right now; replace with something better
    var fileContents = fs.readFileSync(filename, "utf8");
    var translatables = fileContents.match(/translate\s*\(.*\)/g);
    //console.log(translatables);
    if(translatables) {
        // jshint loopfunc: true
        for(var i = 0; i < translatables.length; i++) {
            console.log(funParse(translatables[i], 'translate'));
            if(/^translate\s*\(\s*['"](.*)['"]$/.test(translatables[i])) { // A string-looking thing
                if(!dirJSON[RegExp.$1]) { // Does not yet exist
                    dirJSON[RegExp.$1] = {};
                }
                commander.translateTo.forEach(function(lang) {
                    if(!dirJSON[RegExp.$1][lang]) { // No translation, yet
                        dirJSON[RegExp.$1][lang] = translate("MISSING TRANSLATION");
                    }
                });
            } else {
                var translateMessage = translate("FOUND VARIABLE INPUT: $[1]", translatables[i]);
                dirJSON[translateMessage] = {};
                commander.translateTo.forEach(function(lang) {
                    dirJSON[translateMessage][lang] = translate("MISSING TRANSLATION");
                });
            }
        }
    }
}
*/

// ## The *processDir* function
// generates a ``translations.json`` file for the current directory, but does
// not override the previous file -- only augments it
function processDir(dir) {
    // JSON object for the current directory
    var dirJSON = {};
    // Path where translations will go
    var translations = path.join(dir, "translations.json");
    // Check for pre-existing ``translations.json`` file
    if(fs.existsSync(translations)) {
        var currJSON = JSON.parse(fs.readFileSync(translations, "utf8"));
        dirJSON = mergeObjs(dirJSON, currJSON);
    }

    // Build pattern matching for searchable files
    var extRegExpStr = "(";
    for(var i = 0; i < commander.extensions.length; i++) {
        extRegExpStr += commander.extensions[i];
        if(i < commander.extensions.length-1) { extRegExpStr += "|"; }
        else { extRegExpStr += ")$"; }
    }
    var extRegExp = new RegExp(extRegExpStr);

    // Process files in the current directory
    var files = fs.readdirSync(dir);
    files.forEach(function(file) {
        if(fs.statSync(path.join(dir, file)).isFile() && extRegExp.test(file)) {
            counter++;
            console.log("INC Counter to " + counter);
            console.log("Call processFile " + path.join(dir, file));
            processFile(path.join(dir, file), dirJSON, function(dirJSON){
                counter--;
                console.log(counter);
                if (counter === 0){
                    fs.writeFileSync(translations, JSON.stringify(dirJSON, null, "  "), "utf8");
                } 
            });
        }
        if(commander.recursive && fs.statSync(path.join(dir, file)).isDirectory() && file != '.git') {
            processDir(path.join(dir, file));
        }
    });

    // Output dirJSON to file
    //fs.writeFileSync(translations, JSON.stringify(dirJSON, null, "	"), "utf8");
}

// Get the ball rollin'
processDir(commander.outputDir);
