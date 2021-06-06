// clint: a stupidly tiny command line interface helper
// inspired by commander.js

"use strict"
const process = require('process');
const EventEmitter = require('events');

class Clint extends EventEmitter {

    constructor() {
        super()
        this.shortcuts = {}
        this.rshortcuts = {}
        this.commands = {}
        this.parsers = {}
    }

    // simply returns the (optionally indented) help string, separated with their description with your separator or :

    help(indentation, separator) {

        if (separator == null) separator = " : "

        indentation = indent((indentation == null) ? 2 : indentation)

        var helpstring = "",
            commands = []

        for (var option in this.commands) {
            var shortcut = this.rshortcuts[option]
            if (shortcut) option += ", " + shortcut
            commands.push(option)
        }

        var max = Math.max.apply(Math, commands.map(function (c) {
            return c.length
        })), i = 0

        for (var option in this.commands) {
            var usage = this.commands[option], command = commands[i]
            if (usage && usage !== true) helpstring += indentation + command + indent(max - command.length) + separator + usage + "\n"
            i++
        }

        return helpstring

    }

    // sets a command. usage: .command("--help", "-h" or null, "helps people", optionalParser)

    command(mm, m, msg, parse) {
        this.commands[mm] = msg || true
        this.parsers[mm] = parse

        if (m) {
            this.shortcuts[m] = mm
            this.rshortcuts[mm] = m
        }

        return this
    }


    // starts parsing and emit events. usage: .parse(process.argv.slice(2)) to parse command line arguments.

    parse(args) {

        var temp = [], command

        args.forEach(function (arg, i) {
            var theCommand = this.commands[arg] && arg || this.shortcuts[arg]

            if (theCommand) {
                if (command) execute(this, command, temp)
                command = theCommand
                temp = null
            } else if (command) {
                (temp || (temp = [])).push(arg)
            }

        }, this)

        if (command) execute(this, command, temp)
        this.emit('complete')

        return this

    }

    go() {
        this.parse(process.argv.slice(2))
    }

}

var indent = function (num) {
    var str = ""
    for (var i = 0; i < num; i++) str += " "
    return str
}

var defaultParser = function (arg) {
    return arg
}

var execute = function (self, command, args) {
    if (!args || !args.length) args = [null]

    var chunk = args.map(function (arg) {
        var parsed = (self.parsers[command] || defaultParser)(arg)
        self.emit("command", command, parsed)
        return parsed
    })

    self.emit.apply(self, ["chunk", command].concat(chunk))
}

export function clint() { return new Clint };

export default new Clint;
