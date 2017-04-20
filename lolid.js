/**
* lolid - MoePanel Daemon
* by MoePanel Development
**/

const child = require("child_process");
const express = require("express");
var isSlave = false;

if (process.argv[2] === "--slave") {
	process.title = "MoePanel Daemon - lolid - Slave";
	isSlave = true;
	console.log("running as slave");
} else {
	process.title = "MoePanel Daemon - lolid - Master";
	var slave = child.fork(process.argv[1], ["--slave"]);
	console.log("running as master");
}

if (!isSlave) {
	const app = express();
	const bP = require("body-parser");
	app.use(bP.json());
	app.get("/", (_, res) => {
		let result = {
			message: "You have reached the MoePanel RESTful API."
		}
		res.json(result);
	});
	
	app.get("/server/methods", (_, res) => {
		let result = {
			methods: ["start", "stop", "restart", "kill"]
		}
		res.json(result);
	});
	
	app.post("/server/methods/start", (req, res) => {
		if (typeof(req.body.api_key) === undefined) {
			let result = {
				error: "API key required"
			}
			res.json(result);
		} else {
			if (req.body.api_key === "demo") {
				let result = {
					"success": "Server started"
				}
				res.json(result);
			} else {
				let result = {
					"error": "API key invalid"
				}
				res.json(result);
			}
		}
	});
	
	app.all("*", (req, res) => {
		let result = {
			error: "Invalid API call."
		}
		res.json(result);
	});
	
	var server = app.listen(9090, () => {
		var host = server.address().address
		var port = server.address().port

		console.log("RESTful API listening at http://%s:%s", host, port)
		slave.send({type: "ready"});
	});
} else {
	
}