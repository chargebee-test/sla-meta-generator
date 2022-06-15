const core = require('@actions/core');
const MetaGenerator = require('./src/meta-generator')


const microService = core.getInput('micro-service');
const specFiles = core.getInput('spec-files')

let metaGenerator = new MetaGenerator(specFiles,microService)
metaGenerator.createMetaFile();

