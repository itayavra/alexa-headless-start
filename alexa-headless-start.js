'use strict';

let spawn = require('child_process').spawn;
let carry = require('carrier').carry;
let fs = require('fs');

let mainLogFileName = 'alexa-headless-start.log';
let logsDirectory = 'logs';
let alexaAvsSampleAppDir = '~/Desktop/alexa-avs-sample-app/samples';

function runScript(scriptName, scriptInitializedString, onScriptInitialized) {
    try {
        log(`Starting ${scriptName}`, mainLogFileName);

        let scriptLogFileName = scriptName + '.log';
        let isScriptInitialized = false;
        let scriptProcess = spawn('sh', [`scripts/${scriptName}`]);
        scriptProcess.on('error', err => {
            log(err, mainLogFileName);
        })

        scriptProcess.on('close', function (code) {
            log(`Script ${scriptName} exited with code ${code}`, scriptLogFileName);
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
            log(`${scriptName} is initialized`, mainLogFileName);

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

    runScript('companionService.sh', 'Listening on port 3000',
        () => runScript('javaClient.sh', 'Logged in.',
            () => runScript('wakeWordAgent.sh', 'Connected to AVS client',
                () => playAlexaHello()
            )
        )
    );
}

startAlexa();