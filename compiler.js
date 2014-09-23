//define some global stuff
var code = ""; //code that goes in
var compiledcode = "//Compiled into JavaScript by EasyIO"; //code that comes out
var codebytes = []; //stores "bytes" of code, a list of the tokens
var errorlist = [];

function checkString(variable) { //define a string
	var passed = false;
	if (variable.charAt(0) === "\"" && variable.charAt(variable.length-1) === "\"") {
		passed = true;
	}
	return passed;
}
function checkNum(variable) { //define a number
	var passed = false;
	if (parseInt(variable)) {
		passed = true;
	}
	return passed;
}

//lexer, converts code into "bytes", essentially keywords
function lex(code) {
	var tok = "";
	var state = false;
	for (var i=0; i<code.length; i++) {
		var char = code.charAt(i);
		if (char === " " || char === "\n" && state === false) {
			if (state === false) {
				if(tok !== "") {
					codebytes.push(tok);
					tok = "";
				}
			}
			else {
				tok += char;
			}
		}
		else if (char === "\"") {
			state = !state;
			tok += char;
			if (state === false) {
				codebytes.push(tok);
				tok = "";
			}
		}
		else if (char === "+" || char === "-") {
			if (state === false) {
				if (tok === "") {
					tok += char;
					codebytes.push(tok);
					tok = "";
				}
				else {
					codebytes.push(tok);
					tok = "";
					tok += char;
					codebytes.push(tok);
					tok = "";
				}
			}
			else {
				tok += char;
			}
		}
		else {
			tok += char;
		}
	}
	if(tok !== "") {
		codebytes.push(tok);
		tok = "";
	}
}

//check to make sure commands have the right type parameters
function typecheck(codebytes) {
	var passed = true;
	for (var i=0; i<codebytes.length; i++) {
		var byte = codebytes[i];
		if (byte === "+" || byte === "-") {
			var term1 = codebytes[i-1];
			var term2 = codebytes[i+1];
			if (!checkNum(term1) && !checkString(term1)) {
				errorlist.push("operatorfail");
				passed = false;
			}
			else if (!checkNum(term2) && !checkString(term2)) {
				errorlist.push("operatorfail");
				passed = false;
			}
		}
		else if (byte === "print") {
			i += 1;
			if (codebytes[i]) {
				var sbyte = codebytes[i];
				if (checkNum(sbyte) === false && checkString(sbyte) === false) {
					errorlist.push("printfail");
					passed = false;
				}
			}
			else {
				errorlist.push("printfail");
				passed = false;
			}
		}
	}
	return passed;
}


//converter, changes variables into javascript vars
function convert(codebytes) {
	for (var i=0; i<codebytes.length; i++) {
		var byte = codebytes[i];
		if (checkString(byte)) {
			codebytes[i] = byte.substr(1, byte.length-2)
		}
		else if (checkNum(byte)) {
			codebytes[i] = parseInt(byte);
		}
	}
}

//solve expressions
function solve(codebytes) {
	for (var i=0; i<codebytes.length; i++) {
		var byte = codebytes[i];
		if (byte === "+") {
			codebytes[i-1] += codebytes[i+1];
			codebytes.splice(i,i);
			i -= 1;
		}
		else if (byte === "-") {
			codebytes[i-1] -= codebytes[i+1];
			codebytes.splice(i,i);
			i -= 1;
		}
	}
}
//parser, converts "bytes" into actual javascript code
function parse(codebytes) {
	for (var i=0; i<codebytes.length; i++) {
		var byte = codebytes[i];
		if (byte === "print") {
			compiledcode += "\n"
			compiledcode += "consolePrint(\"";
			i += 1;
			var sbyte = codebytes[i];
			compiledcode += sbyte + "\");";
		}
		else {
			errorlist.push("parsefail");
			i = codebytes.length;
			passed = false;
		}
	}
}

//handle errors
function errorhandle(errorlist) {
	if (errorlist.length > 0) {
		consoleClear();
		iconsole.style.color = "red";
		for (var i=0; i<errorlist.length; i++) {
			var error = errorlist[i];
			if (error === "parsefail") {
				consolePrint("Parsing Failed: invalid command.");
			}
			else if (error === "operatorfail") {
				consolePrint("TypeCheck Failed: you can only add/subtract variables.");
			}
			else if (error === "printfail") {
				consolePrint("TypeCheck Failed: you can only print variables.");
			}
		}
	}
}
//reset global variables
function reset() {
	code = "";
	compiledcode = "//Compiled into JavaScript by EasyIO";
	codebytes = [];
	errorlist = [];
}

//run the lexer, typechecker, parser
function compile(code) {
	consoleClear();
	reset();
	lex(code);
	if (errorlist.length === 0) {
		progressbar.value = 15;
		typecheck(codebytes);
	}
	if (errorlist.length === 0) {
		progressbar.value = 30;
		convert(codebytes);
	}
	if (errorlist.length === 0) {
		progressbar.value = 45;
		solve(codebytes);
	}
	if (errorlist.length === 0) {
		progressbar.value = 60;
		parse(codebytes);
	}
	if (errorlist.length === 0) {
		progressbar.value = 100;
	}
	errorhandle(errorlist);
}