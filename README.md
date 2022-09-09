# oliTracker
Simple "tool" to visualize your progress on tasks from previous Informatics Olympiads, to train yourself

Both the API and the site are hosted at https://alenygam.olitracker.com

Thanks to alenygam for hosting the site for free during development, i plan to get a domain and host it myself once i'm satisfied with it

## How to contribute
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

Now you need to compile all of the .ts files, you can do this manually via the command `tsc file.ts` but i recommend you run `tsc --watch` in the root folder. This will compile everything, and recompile any file when it's changed

The last step is to run the server.

To do this, run the following (from the root folder):
```bash
cd backend/
node main.js
```
Now you can just browse to `localhost:8080` on your browser to access the page

Keep in mind that even though the code gets recompiled immediately if you're using `tsc --watch`, the server will NOT restart automatically, instead, you'll need to stop its process (simply press CTRL+C), and then restart it

Obviously you only need to restart the server if you change the backend, if you change the frontend you'll just need to reload the page
