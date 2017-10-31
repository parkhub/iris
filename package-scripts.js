/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-commonjs */

const npsUtils = require('nps-utils');

const { series, concurrent, rimraf } = npsUtils;

module.exports = {
  scripts: {
    commit: {
      description: 'This uses commitizen to help us generate well formatted commit messages',
      script: 'git-cz'
    },
    test: {
      default: 'jest --coverage',
      watch: 'jest --watch',
      integration: 'DEBUG=iris* jest --coverage --config ./jest.integration.json --watch'
    },
    build: {
      description: 'delete the dist directory and run babel to build the files',
      script: series(
        rimraf('dist'),
        'babel --copy-files --out-dir dist --ignore *.test.js,__mocks__ src'
      )
    },
    lint: {
      description: 'lint the entire project',
      script: 'eslint src/**/*.js'
    },
    reportCoverage: {
      description: 'Report coverage stats to codecov. Happens after testing',
      script: 'codecov'
    },
    release: {
      description: 'We automate releases with semantic-release. This should only be run on travis',
      script: series('semantic-release pre', 'npm publish', 'semantic-release post')
    },
    areWeFlow: {
      description: 'Checks how many files ARE NOT flow-inized',
      script: 'are-we-flow-yet src'
    },
    validate: {
      description:
        'This runs several scripts to make sure things look good before committing or on clean install',
      script: concurrent.nps('lint', 'areWeFlow', 'flow', 'test')
    },
    format: {
      description: 'Formats everything with prettier-eslint',
      script: 'prettier-eslint "src/**/*.js" --write'
    },
    docs: {
      description: 'Generate documentation',
      script: 'esdoc'
    },
    todo: {
      description: 'Generate TODO.md from in source TODO and FIXME tags',
      script: 'leasot --reporter markdown src/**/*.js || true >> TODOS.md'
    },
    flow: {
      description: 'Run Flow',
      script: 'flow check'
    }
  },
  options: {
    silent: false
  }
};
