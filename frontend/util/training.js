var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const api = "http://localhost:8080/api/";
function fetchMacro(path, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`${api}${path}`, {
            method: "post",
            body: JSON.stringify(payload),
            headers: {
                "Content-Type": "application/json"
            }
        });
        let data = yield res.json();
        if (typeof data == "string")
            data = JSON.parse(data);
        return data;
    });
}
function getProfile(username) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = "user";
        const payload = {
            action: "get",
            username
        };
        const data = yield fetchMacro(path, payload);
        if (data.success == 0)
            throw new Error(`Error while grabbing UserProfile by username: ${username}`);
        return data;
    });
}
function profileScores(user) {
    const scores = {};
    for (const t of user.scores)
        scores[t.name] = t.score;
    return scores;
}
export { getProfile, profileScores, };
