#!/usr/bin/env node

/*
 * Copyright (c) 2015 Adobe Systems Incorporated. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var fs = require("fs");
var PATH = require("path");
var serverReplay = require("./index");
var parseConfig = require("./parse-config");

var argv = require("yargs")
    .usage("Usage: $0 [options] <.har file>")
    .options({
        c: {
            alias: "config",
            describe: "The config file to use"
        },
        p: {
            alias: "port",
            describe: "The port to run the proxy server on",
            default: 8080
        },
        d: {
            alias: "debug",
            describe: "Turn on debug logging",
            boolean: true
        },
        pr: {
            alias: "proxy",
            describe: "The proxy target"
        }
    })
    .demand(1)
    .argv;

var har = argv._.reduce(function (mergedHar, harPath) {
    var har = JSON.parse(fs.readFileSync(harPath));
    var entries = mergedHar.log.entries.concat(har.log.entries)
    return {
        log: {
            entries
        }
    }
}, {
    log: {
        entries: []
    }
})


var configPath = argv.config;
if (!configPath) {
    if (fs.existsSync(".server-replay.json")) {
        configPath = ".server-replay.json";
    } else if (fs.existsSync(".harmonica.json")) {
        console.log(".harmonica.json is deprecated, use .server-replay.json instead");
        configPath = ".harmonica.json";
    }
}
if (argv.debug) {
    if (configPath) {
        console.log("Using config file from", configPath);
    } else {
        console.log("No config file");
    }
}
var config = parseConfig(configPath ? fs.readFileSync(configPath, "utf8") : null);

serverReplay(har, {
    config: config,
    resolvePath: PATH.dirname(configPath),
    port: argv.port,
    debug: argv.debug,
    proxy: argv.proxy
});

console.log("Listening at https://localhost:" + argv.port);
console.log("Try " + har.log.entries[0].request.url.replace(/^https/, "http"));
