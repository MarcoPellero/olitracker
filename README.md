# oliTracker
Simple "tool" to visualize your progress on tasks from previous Informatics Olympiads, to train yourself

# How to contribute
To setup this repository locally, ensure you have the following installed:
- NodeJS
- Typescript
- Git

Now, simply run this series of commands:
```bash
git clone https://github.com/MarcoPellero/oliTracker.git
cd oliTracker/
npm i
```
This downloads the code and installs all dependencies.

Now you need to compile all of the `.ts` files, you can do this manually via `tsc file.ts` but i recommend you run `tsc --watch` in the root folder. This will compile everything, and recompile any file when it's changed

The last step is to run the server, which just forwards any request going to `https://training.olinfo.it`, as the browser doesn't allow the page to do that because of CORS policy.

To do this, run the following (from the root folder):
```bash
cd backend/
node main.js
```

Keep in mind that even though the code gets recompiled immediately if you're using `tsc --watch`, the server will *NOT* restart automatically
