'use strict';

let spawn = require('child_process').spawn;
let carry = require('carrier').carry;
let fs = require('fs');

// Alexa avs sample app samples path - change this if you have it installed in a different path
let ALEXA_AVS_SAMPLE_APP_SAMPLES_PATH = '/home/pi/Desktop/alexa-avs-sample-app/samples';

let companionServiceScriptArgs = {
    name: 'companionService',
    workingDirectory: `${ALEXA_AVS_SAMPLE_APP_SAMPLES_PATH}/companionService`, 
    command: 'npm start' 
};

let javaClientScriptArgs = { 
    name: 'javaClient',
    workingDirectory: `${ALEXA_AVS_SAMPLE_APP_SAMPLES_PATH}/javaclient`,  
    command: 'mvn exec:exec' 
};

let wakeWordAgentScriptArgs = { 
    name: 'wakeWordAgent',
    workingDirectory: `${ALEXA_AVS_SAMPLE_APP_SAMPLES_PATH}/wakeWordAgent/src`, 
    command: './wakeWordAgent -e kitt_ai' 
};

let mainLogFileName = 'alexa-headless-start.log';
let logsDirectory = 'logs';

function runScript(scriptArgs, scriptInitializedString, onScriptInitialized) {
    try {
        log(`Starting ${scriptArgs.name}`, mainLogFileName);

        let scriptLogFileName = scriptArgs.name + '.log';
        let isScriptInitialized = false;
        let scriptProcess = spawn(scriptArgs.command, { cwd: scriptArgs.workingDirectory, shell: true });
        scriptProcess.on('error', err => {
            log(err, mainLogFileName);
        })

        scriptProcess.on('close', function (code) {
            log(`Script ${scriptArgs.name} exited with code ${code}`, scriptLogFileName);
        });

        scriptProcess.stderr.on('data', function (data) {
            log('stderr: ' + data, scriptLogFileName, true);
        });

        carry(scriptProcess.stdout, line => {
            log(line, scriptLogFileName, true);

            if (isScriptInitialized || !line.includes(scriptInitializedString)) {
                return;
            }

            isScriptInitialized = true;
            log(`${scriptArgs.name} is initialized`, mainLogFileName);

            if (onScriptInitialized) {
                onScriptInitialized();
            }
        });
    } catch (err) {
        log(err, mainLogFileName);
    }
}

function playAlexaHello() {
    spawn('aplay', ['resources/hello.wav']);
}

function writeToFile(text, fileName) {
    if (!fs.existsSync(logsDirectory)) {
        fs.mkdirSync(logsDirectory);
    }

    fs.appendFileSync(`${logsDirectory}/${fileName}`, text + '\n');
}

function log(log, fileName, shouldSkipConsole) {
    let dateString = new Date().toLocaleString();
    let logString = `${dateString}: ${log}`;

    writeToFile(logString, fileName);
    if (shouldSkipConsole) {
        return;
    }

    console.log(logString);
}

function startAlexa() {
    log('--------------', mainLogFileName);
    log('Starting Alexa', mainLogFileName);
    log('--------------', mainLogFileName);

    runScript(companionServiceScriptArgs, 'Listening on port 3000',
        () => runScript(javaClientScriptArgs, 'Logged in.',
            () => runScript(wakeWordAgentScriptArgs, 'Connected to AVS client',
                () => playAlexaHello()
            )
        )
    );
}

startAlexa();