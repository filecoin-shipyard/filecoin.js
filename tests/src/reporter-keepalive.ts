'use strict';

// Maximum time in seconds to suppress output
const MAX_DELAY = 30;

function getTime(): number {
    return (new Date()).getTime();
}

interface Suite {
    title: string;
    file: string;
    suites: Array<Suite>;
}

interface Runner {
  on(event: string, callback: (...args: Array<any>) => void): Runner;
}

export function ReporterKeepAlive(runner: Runner) {
    let suites = 0;
    let fails = 0;
    const errors: Array<string> = [ ];

    const stdoutWrite = process.stdout.write.bind(process.stdout);
    //process.stdout.write = function(buffer: string | Uint8Array, cb?: (err?: Error) => void): boolean {
    process.stdout.write = function(...args: Array<any>): boolean {
        return stdoutWrite("*");
    }

    // Force Output; Keeps the console output alive with periodic updates
    let lastOutput = getTime();
    function forceOutput() {
        if (((getTime() - lastOutput) / 1000) > MAX_DELAY) {
            log(".");
        }
    }
    const timer = setInterval(forceOutput, 1000);

    function log(message: string): void {
        stdoutWrite(message);
        lastOutput = getTime();
    }

    runner.on('suite', function(suite: Suite) {
        suites++;
        fails = 0;
        log("[");
    });

    runner.on('suite end', function() {
        suites--;
        log("]");

        if (suites === 0) {
            process.stdout.write = stdoutWrite;
            clearTimeout(timer);
            console.log("")
            if (errors.length) {
                console.log("---------------")
                errors.forEach((error, index) => {
                    if (index > 0) { console.log(""); }
                    console.log(error);
                });
            }
            console.log("---------------")
        }
    });

    runner.on('test', function(test) {
        forceOutput();
    });

    runner.on('fail', function(test, error) {
        fails++;
        if (fails < 10) {
            errors.push(`Error #${ errors.length } (${ test.title }): ${ error.message }\n${ error.stack }`);
            log("!");
        }
    });

    runner.on('pass', function(test) {
        forceOutput();

    });

    runner.on('pending', function(test) {
        log("?");
    });
}
