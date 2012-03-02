// clint: a stupidly tiny command line interface helper
// inspired by commander.js

//clint

var emitter = require("emi")

var clint = function(){
	this.shortcuts = {}
	this.rshortcuts = {}
	this.options = {}
	this.parsers = {}
}

clint.prototype = new emitter

var indent = function(num){
	var str = ""
	for (var i = 0; i < num; i++) str += " "
	return str
}

// simply returns the (optionally indented) help string, separated with their description with your separator or :

clint.prototype.help = function(idt, separator){

	if (separator == null) separator = " : "

	idt = indent((idt == null) ? 2 : idt)

	var helpstring = "",
		commands = []

	for (var option in this.options){
		var shortcut = this.rshortcuts[option]
		if (shortcut) option += ", " + shortcut
		commands.push(option)
	}

	var max = Math.max.apply(Math, commands.map(function(c){
		return c.length
	})), i = 0

	for (var option in this.options){
		var usage = this.options[option], command = commands[i]
		helpstring += idt + command + indent(max - command.length) + separator + usage + "\n"
		i++
	}

	return helpstring
}

// sets an option. usage: .option("--help", "-h" or null, "helps people", optionalParser)

clint.prototype.option = function(mm, m, msg, parse){
	this.options[mm] = msg
	this.parsers[mm] = parse

	if (m){
		this.shortcuts[m] = mm
		this.rshortcuts[mm] = m
	}

	return this
}

var defaultParser = function(arg){
	return arg
}

clint.prototype.execute = function(command, args){
	if (!args || !args.length) args = [null]
	for (var i = 0, l = args.length; i < l; i++) this.emit(command, (this.parsers[command] || defaultParser)(args[i]))
	return this;
}

// starts parsing and emit events. usage: .parse(process.argv.slice(2))

clint.prototype.parse = function(args){
	var temp = [], command

	args.forEach(function(arg, i){
		if (arg.indexOf("-") === 0){
			var shortcut = this.shortcuts[arg]
			if (shortcut) arg = shortcut
			if (!this.options[arg]) return
			if (command) this.execute(command, temp)
			command = arg
			temp = null
		} else if (command){
			(temp || (temp = [])).push(arg)
		}

	}, this)

	if (command) this.execute(command, temp)
	this.emit('complete')

	return this
}

module.exports = function(){
	return new clint
}
