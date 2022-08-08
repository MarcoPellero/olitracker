"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const express_1 = __importDefault(require("express"));
const baseUrl = "https://training.olinfo.it";
const port = 8080;
const app = (0, express_1.default)();
app.use(express_1.default.static("../frontend/"));
app.use(express_1.default.json());
const anyReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `${baseUrl}${req.path}`;
    const payload = {
        method: req.method,
        headers: {
            "Content-Type": "application/json",
            "cookie": req.get("cookie") || ""
        }
    };
    if (req.body) // some requests, like GET, don't have a body
        payload.body = JSON.stringify(req.body);
    try {
        const forward = yield (0, cross_fetch_1.default)(url, payload);
        res.status(forward.status);
        res.statusMessage = forward.statusText;
        if (forward.status == 200) {
            const cookie = forward.headers.get("set-cookie");
            if (cookie)
                res.cookie("token", cookie.split("token=")[1]);
            const data = yield forward.json();
            res.json(JSON.stringify(data));
        }
        else
            res.end();
    }
    catch (err) {
        res.status(500).end();
        console.log(err);
    }
});
app.post("/api/*", anyReq);
app.get("/api/*", anyReq);
app.listen(port, () => {
    console.log(`Server listening at port {${port}}`);
});
