Changelog
=========

## Version [0.4.8](https://github.com/Larnixva/jall/releases/tag/v0.4.8)
- **Added**
  - _xlocalize:_ Option (`-o, --output-path <path>`) to specify output path
  - _xlocalize:_ Option (`-v, --verbose`) for verbose output
  - _xlocalize:_ Option (`-f, --function-name <name>`) to specify the name of the translate function
  - _xlocalize:_ Don't run over itself
  - _xlocalize:_ Exclude `.git` folder
  - _Package:_ Added `mocha` dependency for new tests
  - _Tests:_ New tests for `xlocalize`, using `mocha`
- **Changed**
  - _xlocalize:_ Substituted RegEx parsing with proper parser
  - _xlocalize:_ Fixed file extension filter
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