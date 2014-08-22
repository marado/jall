var exec = require('child_process').exec;
var assert = require('assert');
var fs = require('fs');
var path = require('path');

process.chdir('./xlocalize');

describe('xlocalize run-able', function() {
    it('should run', function(done) {
        exec('../../bin/xlocalize.js -h', function(err, stdout, stderr) {
            assert.strictEqual(err, null);
            done();
        });
    });
});

describe('generate locales non-recursive', function() {
    before(function(done) {
        if (fs.existsSync(path.join(process.cwd(), 'translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'translations.json'));
        if (fs.existsSync(path.join(process.cwd(), 'subdir/translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'subdir/translations.json'));
        if (fs.existsSync(path.join(process.cwd(), 'js/translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'js/translations.json'));
        done();
    });

    it('should create file in working directory', function(done) {
        var dir = path.join(process.cwd(), 'translations.json');
        exec('../../bin/xlocalize.js -R -t en,de,pt', function(err, stdout, stderr) {
            var exists = fs.existsSync(dir);
            assert.strictEqual(exists, true);
            done();
        });
    });

    it('should not create files in subdirectories', function(done) {
        var exists = false;
        exec('../../bin/xlocalize.js -R -t en,de,pt', function(err, stdout, stderr) {
            if (fs.existsSync(path.join(process.cwd(), 'subdir/translations.json'))) {
                exists = true;
            }
            else if (fs.existsSync(path.join(process.cwd(), 'js/translations.json'))) {
                exists = true;
            }
            assert.notStrictEqual(exists, true);
            done();
        });
    });

    it('should generate proper translations.json', function(done) {
        var filename = path.join(process.cwd(), 'translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(process.cwd(), '../results/xlocalize.1.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });
});

describe('generate locales recursive', function() {
    before(function(done) {
        if (fs.existsSync(path.join(process.cwd(), 'translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'translations.json'));
        if (fs.existsSync(path.join(process.cwd(), 'subdir/translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'subdir/translations.json'));
        if (fs.existsSync(path.join(process.cwd(), 'js/translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'js/translations.json'));
        done();
    });

    it('should create file in working directory and subdirectories', function(done) {
        var dir = path.join(process.cwd(), 'translations.json');
        var exists = true;
        exec('../../bin/xlocalize.js -t en,de,pt', function(err, stdout, stderr) {
            if (!fs.existsSync(path.join(process.cwd(), 'translations.json'))) {
                exists = false;
            }
            else if (!fs.existsSync(path.join(process.cwd(), 'subdir/translations.json'))) {
                exists = false;
            }
            else if (!fs.existsSync(path.join(process.cwd(), 'js/translations.json'))) {
                exists = false;
            }
            assert.strictEqual(exists, true);
            done();
        });
    });

    it('should generate proper translations.json in subdirectory', function(done) {
        var filename = path.join(process.cwd(), 'js/translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(process.cwd(), '../results/xlocalize.2.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });

    it('should generate proper translations.json for multiple sources', function(done) {
        var filename = path.join(process.cwd(), 'subdir/translations.json');
        var data = fs.readFileSync(filename, {encoding: 'utf8'});
        data = JSON.parse(data);

        filename = path.join(process.cwd(), '../results/xlocalize.3.json');
        var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
        data2 = JSON.parse(data2);

        assert.deepEqual(data, data2);
        done();
    });
});

describe('add new languages without overriding old translations', function() {
    before(function(done) {
        fs.createReadStream(path.join(process.cwd(), '../templates/xlocalize.1.json')).pipe(fs.createWriteStream(path.join(process.cwd(), 'translations.json')));
        fs.createReadStream(path.join(process.cwd(), '../templates/xlocalize.2.json')).pipe(fs.createWriteStream(path.join(process.cwd(), 'js/translations.json')));
        fs.createReadStream(path.join(process.cwd(), '../templates/xlocalize.3.json')).pipe(fs.createWriteStream(path.join(process.cwd(), 'subdir/translations.json')));
        done();
    });

    it('should update correctly in working directory', function(done) {
        exec('../../bin/xlocalize.js -R -t en,de,pt,es', function(err, stdout, stderr) {
            var filename = path.join(process.cwd(), 'translations.json');
            var data = fs.readFileSync(filename, {encoding: 'utf8'});
            data = JSON.parse(data);

            filename = path.join(process.cwd(), '../results/xlocalize.1.new.json');
            var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
            data2 = JSON.parse(data2);

            assert.deepEqual(data, data2);
            done();
        });
    });

    it('should update correctly in subdirectories', function(done) {
        exec('../../bin/xlocalize.js -t en,de,pt,es', function(err, stdout, stderr) {
            var filename = path.join(process.cwd(), 'js/translations.json');
            var data = fs.readFileSync(filename, {encoding: 'utf8'});
            data = JSON.parse(data);

            filename = path.join(process.cwd(), '../results/xlocalize.2.new.json');
            var data2 = fs.readFileSync(filename, {encoding: 'utf8'});
            data2 = JSON.parse(data2);

            assert.deepEqual(data, data2);

            filename = path.join(process.cwd(), 'subdir/translations.json');
            data = fs.readFileSync(filename, {encoding: 'utf8'});
            data = JSON.parse(data);

            filename = path.join(process.cwd(), '../results/xlocalize.3.new.json');
            data2 = fs.readFileSync(filename, {encoding: 'utf8'});
            data2 = JSON.parse(data2);

            assert.deepEqual(data, data2);
            done();
        });
    });
    after(function() {
        if (fs.existsSync(path.join(process.cwd(), 'translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'translations.json'));
        if (fs.existsSync(path.join(process.cwd(), 'subdir/translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'subdir/translations.json'));
        if (fs.existsSync(path.join(process.cwd(), 'js/translations.json')))
            fs.unlinkSync(path.join(process.cwd(), 'js/translations.json'));
    });
});
