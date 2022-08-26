var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function getAllTasks(from, to) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = "gphdM1jkKB5gEYSdkx8UD";
        const url = (year) => `https://stats.olinfo.it/_next/data/${id}/contest/${year}.json`;
        const tasks = {};
        for (let i = from; i <= to; i++) {
            try {
                const res = yield fetch(url(i));
                const data = yield res.json();
                tasks[i] = data.pageProps.contest.tasks;
                // task.name is inconsistent between stats.olinfo & training.olinfo
                // for ease of use i'm normalizing them all to the training.olinfo standard
                for (const t of tasks[i])
                    if (t.link)
                        t.name = t.link.split("/task/")[1].split("/statement")[0];
            }
            catch (err) { }
        }
        return tasks;
    });
}
export { getAllTasks };
