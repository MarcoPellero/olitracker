var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var apiURL = "http://localhost:8080/api/";
var OiiTasks = [];
function fetchMacro(path, payload) {
    return __awaiter(this, void 0, void 0, function () {
        var res, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch("".concat(apiURL).concat(path), {
                        method: "post",
                        body: JSON.stringify(payload),
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })];
                case 1:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 2:
                    data = _a.sent();
                    if (typeof data == "string") // sometimes it returns a string instead of an object; this API isn't great
                        return [2 /*return*/, JSON.parse(data)];
                    return [2 /*return*/, data];
            }
        });
    });
}
function login() {
    return __awaiter(this, void 0, void 0, function () {
        var path, username, password, keep_signed, payload, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    path = "user";
                    username = document.getElementById("username").value;
                    password = document.getElementById("password").value;
                    keep_signed = document.getElementById("keep_signed").checked;
                    payload = {
                        action: "login",
                        username: username,
                        password: password,
                        keep_signed: keep_signed
                    };
                    return [4 /*yield*/, fetchMacro(path, payload)];
                case 1:
                    data = _a.sent();
                    // add some visible popups
                    if (data.success == 1)
                        console.log("Login successful");
                    else
                        console.log("Login unsuccessful");
                    return [2 /*return*/];
            }
        });
    });
}
function isLogged() {
    return __awaiter(this, void 0, void 0, function () {
        var cookies, exists, _i, cookies_1, x;
        return __generator(this, function (_a) {
            cookies = document.cookie.split(";");
            exists = false;
            for (_i = 0, cookies_1 = cookies; _i < cookies_1.length; _i++) {
                x = cookies_1[_i];
                exists = exists && x.startsWith("token=");
            }
            return [2 /*return*/, exists];
        });
    });
}
var getTaskId = function (link) { return link.split("/task/")[1].split("/statement")[0]; };
function getTaskScore(name) {
    return __awaiter(this, void 0, void 0, function () {
        var path, payload, data, tasks, _i, tasks_1, t;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isLogged())
                        throw new Error("Can't retrieve task score without being logged in");
                    path = "task";
                    payload = {
                        action: "list",
                        search: name,
                        first: 0,
                        last: 15
                    };
                    return [4 /*yield*/, fetchMacro(path, payload)];
                case 1:
                    data = _a.sent();
                    tasks = data.tasks;
                    for (_i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
                        t = tasks_1[_i];
                        if (t.name == name)
                            return [2 /*return*/, t.score];
                    }
                    return [2 /*return*/, undefined];
            }
        });
    });
}
function getOiiTasks() {
    return __awaiter(this, void 0, void 0, function () {
        var id, url, firstYear, lastYear, year, res, data, tasks, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = "gphdM1jkKB5gEYSdkx8UD";
                    url = function (year) { return "https://stats.olinfo.it/_next/data/".concat(id, "/contest/").concat(year, ".json"); };
                    firstYear = 2001;
                    lastYear = new Date().getFullYear();
                    year = firstYear;
                    _a.label = 1;
                case 1:
                    if (!(year <= lastYear)) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, fetch(url(year))];
                case 3:
                    res = _a.sent();
                    return [4 /*yield*/, res.json()];
                case 4:
                    data = _a.sent();
                    tasks = data.pageProps.contest.tasks;
                    OiiTasks.push(tasks);
                    return [3 /*break*/, 6];
                case 5:
                    err_1 = _a.sent();
                    console.log(err_1);
                    return [3 /*break*/, 6];
                case 6:
                    year++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function fillTable() {
    return __awaiter(this, void 0, void 0, function () {
        var table, i, row, thYear, _i, _a, t, elem;
        return __generator(this, function (_b) {
            table = document.getElementById("tasks");
            for (i = 0; i < OiiTasks.length; i++) {
                row = document.createElement("tr");
                thYear = document.createElement("th");
                thYear.textContent = OiiTasks[i][0].contest_year.toString();
                row.appendChild(thYear);
                for (_i = 0, _a = OiiTasks[i]; _i < _a.length; _i++) {
                    t = _a[_i];
                    elem = document.createElement("td");
                    elem.textContent = t.name;
                    row.appendChild(elem);
                }
                table.appendChild(row);
            }
            return [2 /*return*/];
        });
    });
}
function colorTable() {
    var e_1, _a, e_2, _b;
    return __awaiter(this, void 0, void 0, function () {
        var rows, _c, _d, _e, i, tasks, cells, _f, _g, _h, j, t, c, score, e_2_1, e_1_1;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    rows = document.getElementsByTagName("tr");
                    _j.label = 1;
                case 1:
                    _j.trys.push([1, 18, 19, 24]);
                    _c = __asyncValues(OiiTasks.entries());
                    _j.label = 2;
                case 2: return [4 /*yield*/, _c.next()];
                case 3:
                    if (!(_d = _j.sent(), !_d.done)) return [3 /*break*/, 17];
                    _e = _d.value, i = _e[0], tasks = _e[1];
                    cells = rows[i].getElementsByTagName("td");
                    _j.label = 4;
                case 4:
                    _j.trys.push([4, 10, 11, 16]);
                    _f = (e_2 = void 0, __asyncValues(tasks.entries()));
                    _j.label = 5;
                case 5: return [4 /*yield*/, _f.next()];
                case 6:
                    if (!(_g = _j.sent(), !_g.done)) return [3 /*break*/, 9];
                    _h = _g.value, j = _h[0], t = _h[1];
                    c = cells[j];
                    if (typeof t.link !== "string") // typescript didn't recognize it as a type guard if i used tasks[j]
                        return [3 /*break*/, 8];
                    return [4 /*yield*/, getTaskScore(getTaskId(t.link))];
                case 7:
                    score = _j.sent();
                    if (score == undefined)
                        return [3 /*break*/, 8];
                    c.classList.add("".concat(score == 0 ? "no" : score == 100 ? "all" : "some", "Points"));
                    _j.label = 8;
                case 8: return [3 /*break*/, 5];
                case 9: return [3 /*break*/, 16];
                case 10:
                    e_2_1 = _j.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 16];
                case 11:
                    _j.trys.push([11, , 14, 15]);
                    if (!(_g && !_g.done && (_b = _f["return"]))) return [3 /*break*/, 13];
                    return [4 /*yield*/, _b.call(_f)];
                case 12:
                    _j.sent();
                    _j.label = 13;
                case 13: return [3 /*break*/, 15];
                case 14:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 15: return [7 /*endfinally*/];
                case 16: return [3 /*break*/, 2];
                case 17: return [3 /*break*/, 24];
                case 18:
                    e_1_1 = _j.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 24];
                case 19:
                    _j.trys.push([19, , 22, 23]);
                    if (!(_d && !_d.done && (_a = _c["return"]))) return [3 /*break*/, 21];
                    return [4 /*yield*/, _a.call(_c)];
                case 20:
                    _j.sent();
                    _j.label = 21;
                case 21: return [3 /*break*/, 23];
                case 22:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 23: return [7 /*endfinally*/];
                case 24: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getOiiTasks()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fillTable()];
                case 2:
                    _a.sent();
                    colorTable();
                    console.log(OiiTasks);
                    return [2 /*return*/];
            }
        });
    });
}
main();
