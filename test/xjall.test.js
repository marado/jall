/* jshint undef: false, unused: false */
var exec = require('child_process').exec;
var assert = require('assert');
var fs = require('fs');
var path = require('path');

process.chdir('./test/xjall');

var executable = path.join(process.cwd(), '../../bin/xjall.js');
var optionsdir = path.join(process.cwd(), './options');
var singledir = path.join(process.cwd(), './single');
var multipledir = path.join(process.cwd(), './multiple');
var resultsdir = path.join(process.cwd(), '../results');
var templatesdir = path.join(process.cwd(), '../templates');

// --- General tests ---

describe('xjall run-able', function() {
    it('should run', function(done) {
        exec(executable + ' -h', function(err, stdout, stderr) {
            assert.strictEqual(err, null);
            done();
        });
    });
});

describe('test parameters', function() {
    beforeEach(function(done) {
        process.chdir(optionsdir);
        if (fs.existsSync(path.join(optionsdir, 'translations.json')))
            fs.unlinkSync(path.join(optionsdir, 'translations.json'));
        if (fs.existsSync(path.join(optionsdir, 'subdir/translations.json')))
            fs.unlinkSync(path.join(optionsdir, 'subdir/translations.json'));
        done();
    });
    it('should include .ejs and .xml files', function(done) {
        exec(executable + ' -t en,de,pt -e xml,ejs', function(err, stdout, stderr) {
            var filename = path.join(optionsdir, 'translations.json');
            var data = fs.readFileSync(filename, {encoding: 'utf8'});
            data = JSON.parse(data);

            filename = path.join(resultsdir, 'xjall.5.json');
            var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
            data2 = JSON.parse(data2);

            assert.deepEqual(data, data2);
            done();
        });
    });
    it('should include .js and .html files', function(done) {
        exec(executable + ' -t en,de,pt', function(err, stdout, stderr) {
            var filename = path.join(optionsdir, 'translations.json');
            var data = fs.readFileSync(filename, {encoding: 'utf8'});
            data = JSON.parse(data);

            filename = path.join(resultsdir, 'xjall.6.json');
            var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
            data2 = JSON.parse(data2);

            assert.deepEqual(data, data2);
            done();
        });
    });
    it('should use the right output path', function(done) {
        exec(executable + ' -t en,de,pt -o ./subdir', function(err, stdout, stderr) {
            assert.strictEqual(fs.existsSync(path.join(optionsdir, 'subdir/translations.json')), true);
            assert.strictEqual(fs.existsSync(path.join(optionsdir, 'translations.json')), false);
            done();
        });
    });
    it('should use the right function name', function(done) {
        exec(executable + ' -t en,de,pt --function-name _t', function(err, stdout, stderr) {
            var filename = path.join(optionsdir, 'translations.json');
            var data = fs.readFileSync(filename, {encoding: 'utf8'});
            data = JSON.parse(data);

            filename = path.join(resultsdir, 'xjall.7.json');
            var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
            data2 = JSON.parse(data2);

            assert.deepEqual(data, data2);
            done();
        });
    });
    after(function(done) {
        if (fs.existsSync(path.join(optionsdir, 'translations.json')))
            fs.unlinkSync(path.join(optionsdir, 'translations.json'));
        done();
    });
});

// --- Tests for single translation in file ---

describe('generate locales non-recursive', function() {
    before(function(done) {
        process.chdir(singledir);
        if (fs.existsSync(path.join(singledir, 'translations.json')))
            fs.unlinkSync(path.join(singledir, 'translations.json'));
        if (fs.existsSync(path.join(singledir, 'subdir/translations.json')))
            fs.unlinkSync(path.join(singledir, 'subdir/translations.json'));
        if (fs.existsSync(path.join(singledir, 'js/translations.json')))
            fs.unlinkSync(path.join(singledir, 'js/translations.json'));
        exec(executable + ' -R -t en,de,pt', function(err, stdout, stderr) {
            done();
        });
    });
    it('should create file in working directory', function(done) {
        assert.strictEqual(fs.existsSync(path.join(singledir, 'translations.json')), true);
        done();
    });
    it('should not create files in subdirectories', function(done) {
        var exists = false;
        if (fs.existsSync(path.join(singledir, 'subdir/translations.json')))
            exists = true;
        else if (fs.existsSync(path.join(singledir, 'js/translations.json')))
            exists = true;
        assert.notStrictEqual(exists, true);
        done();
    });
    it('should generate proper translations.json', function(done) {
        var filename = path.join(singledir, 'translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(resultsdir, 'xjall.1.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });
});

describe('generate locales recursive', function() {
    before(function(done) {
        process.chdir(singledir);
        if (fs.existsSync(path.join(singledir, 'translations.json')))
            fs.unlinkSync(path.join(singledir, 'translations.json'));
        if (fs.existsSync(path.join(singledir, 'subdir/translations.json')))
            fs.unlinkSync(path.join(singledir, 'subdir/translations.json'));
        if (fs.existsSync(path.join(singledir, 'js/translations.json')))
            fs.unlinkSync(path.join(singledir, 'js/translations.json'));
        exec(executable + ' -t en,de,pt', function(err, stdout, stderr) {
            done();
        });
    });
    it('should create file in working directory and subdirectories', function(done) {
        var exists = true;
        if (!fs.existsSync(path.join(singledir, 'translations.json')))
            exists = false;
        else if (!fs.existsSync(path.join(singledir, 'subdir/translations.json')))
            exists = false;
        else if (!fs.existsSync(path.join(singledir, 'js/translations.json')))
            exists = false;
        assert.strictEqual(exists, true);
        done();
    });
    it('should generate proper translations.json in subdirectory', function(done) {
        var filename = path.join(singledir, 'js/translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(resultsdir, 'xjall.2.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });
    it('should generate proper translations.json for multiple sources', function(done) {
        var filename = path.join(singledir, 'subdir/translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(resultsdir, 'xjall.3.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });
});

describe('add new languages without overwriting old translations', function() {
    before(function(done) {
        process.chdir(singledir);
        fs.createReadStream(path.join(templatesdir, 'xjall.1.json')).pipe(fs.createWriteStream(path.join(singledir, 'translations.json')));
        fs.createReadStream(path.join(templatesdir, 'xjall.2.json')).pipe(fs.createWriteStream(path.join(singledir, 'js/translations.json')));
        fs.createReadStream(path.join(templatesdir, 'xjall.3.json')).pipe(fs.createWriteStream(path.join(singledir, 'subdir/translations.json')));
        exec(executable + ' -t en,de,pt,es', function(err, stdout, stderr) {
            done();
        });
    });
    it('should update correctly in working directory', function(done) {
        var filename = path.join(singledir, 'translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(resultsdir, 'xjall.1.new.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });
    it('should update correctly in subdirectories', function(done) {
        var filename = path.join(singledir, 'js/translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(resultsdir, 'xjall.2.new.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);

        filename = path.join(singledir, 'subdir/translations.json');
        data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(resultsdir, 'xjall.3.new.json');
        data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });
    after(function() {
        if (fs.existsSync(path.join(singledir, 'translations.json')))
            fs.unlinkSync(path.join(singledir, 'translations.json'));
        if (fs.existsSync(path.join(singledir, 'subdir/translations.json')))
            fs.unlinkSync(path.join(singledir, 'subdir/translations.json'));
        if (fs.existsSync(path.join(singledir, 'js/translations.json')))
            fs.unlinkSync(path.join(singledir, 'js/translations.json'));
    });
});

// --- Tests for multiple translations in file

describe('generate mlutiple locales in one file in working directory', function() {
    before(function(done) {
        process.chdir(multipledir);
        if (fs.existsSync(path.join(multipledir, 'translations.json')))
            fs.unlinkSync(path.join(multipledir, 'translations.json'));
        exec(executable + ' -R -t en,de,pt', function(err, stdout, stderr) {
            done();
        });
    });
    it('should create file in working directory', function(done) {
        var dir = path.join(multipledir, 'translations.json');
        var exists = fs.existsSync(dir);
        assert.strictEqual(exists, true);
        done();
    });
    it('should generate proper translations.json', function(done) {
        var filename = path.join(multipledir, 'translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(resultsdir, 'xjall.4.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });
    after(function() {
        if (fs.existsSync(path.join(multipledir, 'translations.json')))
            fs.unlinkSync(path.join(multipledir, 'translations.json'));
    });
});
