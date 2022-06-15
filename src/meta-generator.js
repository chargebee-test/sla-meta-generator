const core = require('@actions/core');
const yaml = require('js-yaml');
const fs   = require('fs');
var path = require('path')

module.exports = class MetaGenerator {
    
    METHODS = ["get","put","post","delete","options","head","patch","trace"]
    PATHS;
    MICRO_SERVICE;
    
    result = [];

    constructor(paths, microservice){
        this.PATHS = paths;
        this.MICRO_SERVICE = microservice;
    }

    createMetaFile() {
        try {
            console.log(process.env.GITHUB_WORKSPACE)
            const specFiles = JSON.parse(this.PATHS);
            specFiles.forEach(file => {

                const filepath = process.env.GITHUB_WORKSPACE + "/" +file;
                const fileStats = fs.lstatSync(filepath)

                if(fileStats.isDirectory()) {
                    processDirectory(filepath);
                } else if(fileStats.isFile()) {
                    processFile(filepath);
                }
            });

            writeInFile();

        } catch (error) {
            console.error(error)
            core.setFailed(error.message);
        }
    }

    writeInFile() {
        const fileName = `${process.env.GITHUB_WORKSPACE}/${this.MICRO_SERVICE}-endpoints.json`
        fs.writeFile(fileName, JSON.stringify(this.result,null,4), function (err, file) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
    
    processDirectory(dirPath){
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
    
    processFile(filePath) {
        console.log("Processing file : " + filePath)
        if(path.extname(filePath) === ".yaml" 
            ||  path.extname(filePath) === ".yml") {
                const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
                processSpec(doc)
        }
    }
    
    processSpec(doc) {
        console.log("Processing spec : ");
        console.log(doc);
    
        if(doc == null || doc == undefined) return;
    
        let paths = doc.paths;
        for(let key in paths){
            console.log("Processing Path : " +key)
            processPathObject(key, paths[key])
        }
    }
    
    processPathObject(path,pathObject){
        console.log("Processing Path : " +path)
        this.METHODS.forEach(method => {
            if(pathObject[method] != undefined && pathObject[method] != null){
                output = processOperationObject(path, method, pathObject[method])
                this.result.push(output)
            }
        })
    }
    
    processOperationObject(path, method, operationObject) {
        let output = {}
        path = path.replaceAll(/{.*?}/ig,'([^/]+)')
        output.name = operationObject["operationId"]
        output.url = path
        output.method = method
        output.sla_for_response_time = "M1"
        output.criticality = ""
        output.module = ""
        output.micro_service = this.MICRO_SERVICE
        return output
    }

}