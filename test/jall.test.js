/* jshint undef: false, unused: false */
var Localize = require('../lib/jall');
var assert = require('assert');

describe('test empty initialization error', function() {
    it('should throw an error', function(done) {
        assert.throws(function() {
            var badLocalize = new Localize();
            badLocalize.will.never.be.run.here();
        }, function(err) {
            if(err instanceof Error &&
                err.message === "Must provide a valid set of translations.") {
                return true;
            }
            return false;
        });
        done();
    });
});

describe('test bad translations var error', function() {
    it('should throw an error', function(done) {
        assert.throws(function() {
            var badLocalize = new Localize([1,2,3]);
            badLocalize.will.never.be.run.here();
        }, function(err) {
            if(err instanceof Error &&
                err.message === "Must provide a valid set of translations.") {
                return true;
            }
            return false;
        });
        done();
    });
});

describe('test bad translations path error', function() {
    it('should throw an error', function(done) {
        assert.throws(function() {
            var badLocalize = new Localize("/nowheresville");
            badLocalize.will.never.be.run.here();
        }, function(err) {
            if(err instanceof Error &&
                err.message === "Translation Path Invalid") {
                return true;
            }
            return false;
        });
        done();
    });
});

describe('test good translations var', function() {
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            var goodLocalize = new Localize({
                "Testing...": {
                    "es": "Pruebas..."
                }
            });
            return goodLocalize;
        });
        done();
    });
});

describe('test good translations path', function() {
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            var goodLocalize = new Localize("./test/translations");
            return goodLocalize;
        });
        done();
    });
});

describe('test bad setLocale var', function() {
    it('should throw an error', function(done) {
        assert.throws(function() {
            var goodLocalize = new Localize("./test/translations");
            goodLocalize.setLocale(23);
        }, function(err) {
            if(err instanceof Error &&
                err.message === "Locale must be a string") {
                return true;
            }
            return false;
        });
        done();
    });
});

describe('test good setLocale var', function() {
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            var goodLocalize = new Localize("./test/translations");
            goodLocalize.setLocale("es");
        });
        done();
    });
});

describe('test bad translate string', function() {
    it('should throw an error', function(done) {
        assert.throws(function() {
            var goodLocalize = new Localize("./test/translations");
            goodLocalize.setLocale("es");
            goodLocalize.translate("Test2");
        }, function(err) {
            if(err instanceof Error &&
                err.message === "Could not find translation for 'Test2' in the es locale") {
                return true;
            }
            return false;
        });
        done();
    });
});

describe('test good translate string', function() {
    var goodLocalize;
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            goodLocalize = new Localize("./test/translations");
            goodLocalize.setLocale("es");
            goodLocalize.translate("Testing...");
        });
        done();
    });
    it('should return the correct translation', function(done) {
        assert.strictEqual(goodLocalize.translate("Testing..."), "Pruebas...");
        done();
    });
});

describe('test good translate nop', function() {
    var goodLocalize;
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            goodLocalize = new Localize("./test/translations");
            goodLocalize.translate("Testing...");
        });
        done();
    });
    it('should return the correct translation', function(done) {
        assert.strictEqual(goodLocalize.translate("Testing..."), "Testing...");
        done();
    });
});

describe('test good translate substitution', function() {
    var goodLocalize;
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            goodLocalize = new Localize("./test/translations");
            goodLocalize.translate("Substitution: $[1]", 5);
            goodLocalize.setLocale("es");
            goodLocalize.translate("Substitution: $[1]", 5);
            goodLocalize.setLocale("en");
        });
        done();
    });
    it('should return the correct translation', function(done) {
        assert.strictEqual(goodLocalize.translate("Substitution: $[1]", 5), "Substitution: 5");
        goodLocalize.setLocale("es");
        assert.strictEqual(goodLocalize.translate("Substitution: $[1]", 5), "Sustitución: 5");
        done();
    });
});

describe('test good translate multiple substitution', function() {
    var goodLocalize;
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            goodLocalize = new Localize("./test/translations");
            goodLocalize.translate("Multiple substitution: $[1], $[2]", 5, 25);
            goodLocalize.setLocale("es");
            goodLocalize.translate("Multiple substitution: $[1], $[2]", 5, 25);
            goodLocalize.setLocale("en");
        });
        done();
    });
    it('should return the correct translation', function(done) {
        assert.strictEqual(goodLocalize.translate("Multiple substitution: $[1], $[2]", 5, 25), "Multiple substitution: 5, 25");
        goodLocalize.setLocale("es");
        assert.strictEqual(goodLocalize.translate("Multiple substitution: $[1], $[2]", 5, 25), "Sustitución múltiple: 5, 25");
        done();
    });
});

describe('test good dateFormat var initialization', function() {
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            var goodLocalize = new Localize("./test/translations", 25);
            return goodLocalize;
        });
        done();
    });
});

describe('test bad dateFormat var post-initialization', function() {
    it('should throw an error', function(done) {
        assert.throws(function() {
            var badLocalize = new Localize("./test/translations", 25);
            badLocalize.loadDateFormats(25);
        }, function(err) {
            if(err instanceof Error &&
                err.message === "Invalid Date Format provided") {
                return true;
            }
            return false;
        });
        done();
    });
});

describe('test good dateFormat var post-initialization', function() {
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            var goodLocalize = new Localize("./test/translations");
            goodLocalize.loadDateFormats({
                "es": {
                    dayNames: [
                        'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb',
                        'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
                    ],
                    monthNames: [
                        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
                        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                    ],
                    masks: {
                        "default": "dddd, d 'de' mmmm yyyy"
                    }
                }
            });
        });
        done();
    });
});

describe('test good localDate', function() {
    var theDate;
    var goodLocalize;
    it('should not throw an error', function(done) {
        theDate = new Date("4-Jul-1776");
        goodLocalize = new Localize("./test/translations");
        goodLocalize.loadDateFormats({
            "es": {
                dayNames: [
                    'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb',
                    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
                ],
                monthNames: [
                    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ],
                masks: {
                    "default": "dddd, d 'de' mmmm yyyy"
                }
            }
        });
        done();
    });
    it('should provide right dates', function(done) {
        assert.strictEqual(goodLocalize.localDate(theDate), "Thu Jul 04 1776 00:00:00");
        assert.strictEqual(goodLocalize.localDate(theDate, "fullDate"), "Thursday, July 4, 1776");
        assert.strictEqual(goodLocalize.localDate(theDate, "mm/dd/yyyy"), "07/04/1776");
        goodLocalize.setLocale("es");
        assert.strictEqual(goodLocalize.localDate(theDate), "Jueves, 4 de Julio 1776");
        done();
    });
});

describe('test missing translation ignore', function() {
    var goodLocalize;
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            goodLocalize = new Localize("./test/translations");
            goodLocalize.throwOnMissingTranslation(false);
            goodLocalize.setLocale("es");
            goodLocalize.translate("Not found");
        });
        done();
    });
    it('should pass the translation string from argument to return', function(done) {
        assert.strictEqual(goodLocalize.translate("Not found"), "Not found");
        done();
    });
});

describe('test translation strings txt files', function() {
    var goodLocalize;
    it('should not throw an error', function(done) {
        assert.doesNotThrow(function() {
            goodLocalize = new Localize('./test/translations');
            goodLocalize.translate(goodLocalize.strings.helloWorld);
            goodLocalize.setLocale("es");
            goodLocalize.translate(goodLocalize.strings.helloWorld);
            goodLocalize.setLocale("en");
        });
        done();
    });
    it('should provide right translations from the string.txts', function(done) {
        assert.strictEqual(goodLocalize.translate(goodLocalize.strings.helloWorld), "Hello, World!\n");
        goodLocalize.setLocale("es");
        assert.strictEqual(goodLocalize.translate(goodLocalize.strings.helloWorld), "¡Hola, mundo!\n");
        done();
    });
});
