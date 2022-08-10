import fetch from "cross-fetch";
import express, { Request, Response } from "express";

const baseUrl = "https://training.olinfo.it";
const port = 8080;
const app = express();

app.use(express.static("../frontend/"));
app.use(express.json());

const anyReq = async (req: Request, res: Response) => {
	const url = `${baseUrl}${req.path}`;
	const payload: RequestInit = {
		method: req.method,
		headers: {
			"Content-Type": "application/json",
			"cookie": req.get("cookie") || ""
		}
	};


	if (req.body) // some requests, like GET, don't have a body
		payload.body = JSON.stringify(req.body);
	
	try {
		const forward = await fetch(url, payload);
		res.status(forward.status);
		res.statusMessage = forward.statusText;

		if (forward.status == 200) {
			const cookie = forward.headers.get("set-cookie");
			if (cookie)
				res.cookie("token", cookie.split("token=")[1].split(";")[0]);
			
			const data = await forward.json();
			res.json(JSON.stringify(data));
		} else
			res.end();

	} catch (err) {
		res.status(500).end();
		console.log(err);
	} 
};

app.post("/api/*", anyReq);
app.get("/api/*", anyReq);

app.listen(port, () => {
	console.log(`Server listening at port {${port}}`);
});