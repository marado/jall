Changelog
=========

## Version [0.5.0](https://github.com/Larnixva/jall/releases/tag/v0.5.0)
- **Added**
  - _xjall:_ Added original translation string to "MISSING TRANSLATION", like wished in issue [#4](https://github.com/Larnixva/jall/issues/4)
- **Changed**
  - _Tests:_ Adapted tests to suit issue [#4](https://github.com/Larnixva/jall/issues/4)

## Version [0.4.9](https://github.com/Larnixva/jall/releases/tag/v0.4.9)
- **Changed**
  - _xjall:_ Create folder if it doesn't exist
  - _Package:_ Fixed links in package.json
  - _Package:_ Fixed script paths in package.json
  - _Package:_ Version bump

## Version [0.4.8](https://github.com/Larnixva/jall/releases/tag/v0.4.8)
- **Added**
  - _xjall:_ Option (`-o, --output-path <path>`) to specify output path
  - _xjall:_ Option (`-v, --verbose`) for verbose output
  - _xjall:_ Option (`-f, --function-name <name>`) to specify the name of the translate function
  - _xjall:_ Don't run over itself
  - _xjall:_ Exclude `.git` folder
  - _Package:_ Added `mocha` dependency for new tests
  - _Tests:_ New tests for `xjall`, using `mocha`
- **Changed**
  - _xjall:_ Substituted RegEx parsing with proper parser
  - _xjall:_ Fixed file extension filter
  - _Package:_ Renamed to `jall (just another localization library)
  - _Package:_ Updated dependencies (`commander` from 2.1.0 to 2.3.0, `jshint` from 2.4.4 to 2.5.4)
  - _Package:_ Excluded `test` directory from jshint tests
  - _Tests:_ Now using `mocha` for library tests
- **Removed**
  - _Package:_ Removed unused dependencies (`coveralls`, `istanbul`, `nodeunit`)
  - _Tests:_ Removed old shell tests for `xlocalize`
  - _Tests:_ Removed coverage tests

## Version [0.4.7](https://github.com/Larnixva/jall/releases/tag/v0.4.7)
- Forked from [dfellis/node-localize](https://github.com/dfellis/node-localize)