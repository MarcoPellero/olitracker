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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
const startYear = 2000;
const endYear = new Date().getFullYear();
const tasks = {};
const url = "http://localhost:8080";
function getOiiTasks() {
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function* () {
        const id = "gphdM1jkKB5gEYSdkx8UD";
        const url = (year) => `https://stats.olinfo.it/_next/data/${id}/contest/${year}.json`;
        const range = Array.from({ length: endYear - startYear + 1 }, (x, i) => i + startYear);
        try {
            for (var range_1 = __asyncValues(range), range_1_1; range_1_1 = yield range_1.next(), !range_1_1.done;) {
                const year = range_1_1.value;
                try {
                    const res = yield fetch(url(year));
                    const data = yield res.json();
                    tasks[year] = data.pageProps.contest.tasks;
                }
                catch (err) { }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (range_1_1 && !range_1_1.done && (_a = range_1.return)) yield _a.call(range_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
function createTable() {
    const table = $("#tasks")[0];
    for (let year = startYear; year <= endYear; year++) {
        if (!tasks[year])
            continue;
        const row = document.createElement("tr");
        table.appendChild(row);
        const headCell = document.createElement("th");
        headCell.textContent = year.toString();
        row.appendChild(headCell);
        for (const t of tasks[year]) {
            const cell = document.createElement("td");
            cell.textContent = t.name;
            cell.id = `task_${t.name}`;
            row.appendChild(cell);
        }
    }
    if (isLogged())
        colorTable();
}
const isLogged = () => document.cookie.split(";").find(x => x.startsWith("token=")) !== undefined;
function postMacro(path, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${url}${path}`, {
            method: "post",
            credentials: "include",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = yield res.json();
        if (typeof data == "string")
            return JSON.parse(data); // sometimes it returns a string.. like double encoding
        return data;
    });
}
function login() {
    return __awaiter(this, void 0, void 0, function* () {
        const username = $("#username").val();
        const password = $("#password").val();
        const keep_signed = $("#keep_signed").is(":checked");
        const data = yield postMacro("/api/user", { action: "login", username, password, keep_signed });
        if (data.success) {
            console.log("login successful");
            colorTable();
        }
        else
            console.log("login unsuccessful");
    });
}
function getTaskScore(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield postMacro("/api/task", {
            action: "list",
            search: name,
            first: 0,
            last: 15
        });
        for (const t of data.tasks)
            if (t.name == name)
                return t.score;
        return undefined;
    });
}
function colorTable() {
    return __awaiter(this, void 0, void 0, function* () {
        const getId = (link) => link.split("/task/")[1].split("/statement")[0];
        const range = Array.from({ length: endYear - startYear + 1 }, (x, i) => i + startYear);
        for (const year of range) {
            if (!tasks[year])
                continue;
            for (const t of tasks[year]) {
                const elem = $(`#task_${t.name}`);
                if (!t.link) {
                    elem.addClass("oldTask");
                    continue;
                }
                const score = yield getTaskScore(getId(t.link));
                if (score != undefined)
                    elem.addClass(`${score == 100 ? "all" : score == 0 ? "no" : "some"}Points`);
            }
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getOiiTasks();
        createTable();
    });
}
main();
