const core = require('@actions/core');
const github = require('@actions/github');
const yaml = require('js-yaml');
const fs   = require('fs');
var path = require('path')

const METHODS = ["get","put","post","delete","options","head","patch","trace"]
const MICRO_SERVICE = core.getInput('micro-service');

let result = [];

try {
    console.log(`Filename is ${__filename}`);
    console.log(`Directory name is ${__dirname}`)
    console.log(process.env.GITHUB_WORKSPACE)

    
    const specFiles = JSON.parse(core.getInput('spec-files'));
    specFiles.forEach(file => {

        const filepath = process.env.GITHUB_WORKSPACE + "/" +file;
        const fileStats = fs.lstatSync(filepath)

        if(fileStats.isDirectory()) {
            processDirectory(filepath);
        } else if(fileStats.isFile()) {
            processFile(filepath);
        }
    });

    console.log(result);
    writeInFile();

} catch (error) {
    console.error(error)
    core.setFailed(error.message);
}

function writeInFile() {
    const fileName = `${process.env.GITHUB_WORKSPACE}/${MICRO_SERVICE}-endpoints.json`
    fs.open(fileName, 'w', function (err, file) {
        if (err) throw err;
        console.log('Saved!');
    });
}

function processDirectory(dirPath){
    console.log("Processing directory : " + dirPath)
    fs.readdirSync(dirPath).forEach(
        filePath => {
            const fileStats = fs.lstatSync(filePath)
            if(fileStats.isDirectory()) {
                processDirectory(filePath);
            } else if(fileStats.isFile()) {
                processFile(filePath);
            }
        }
    )
}

function processFile(filePath) {
    console.log("Processing file : " + filePath)
    if(path.extname(filePath) === ".yaml" 
        ||  path.extname(filePath) === ".yml") {
            const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
            processSpec(doc)
    }
}

function processSpec(doc) {
    console.log("Processing spec : ");
    console.log(doc);

    if(doc == null || doc == undefined) return;

    let paths = doc.paths;
    for(let key in paths){
        console.log("Processing Path : " +key)
        processPathObject(key, paths[key])
    }
}

function processPathObject(path,pathObject){
    console.log("Processing Path : " +path)
    METHODS.forEach(method => {
        if(pathObject[method] != undefined && pathObject[method] != null){
            output = processOperationObject(path, method, pathObject[method])
            result.push(output)
        }
    })
}

function processOperationObject(path, method, operationObject) {
    let output = {}
    path = path.replaceAll(/{.*?}/ig,'([^/]+)')
    output.name = operationObject["operationId"]
    output.url = path
    output.method = method
    output.sla_for_response_time = "M1"
    output.criticality = ""
    output.module = ""
    output.micro_service = MICRO_SERVICE
    return output
}