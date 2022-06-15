const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');
const fs   = require('fs');

try {
    console.log(`Filename is ${__filename}`);
    console.log(`Directory name is ${__dirname}`)
    console.log(process.env)

    const specFiles = JSON.parse(core.getInput('spec-files'));
    specFiles.forEach(file => {
        const doc = yaml.load(fs.readFileSync(file, 'utf8'));
        console.log(doc);
    });
} catch (error) {
    core.setFailed(error.message);
}