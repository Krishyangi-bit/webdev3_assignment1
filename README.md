# Smart Utility Toolkit

Lab Assignment 1 for Web Dev III (Node.js & Express Backend), Unit 1.

Small utilities built only on Node.js core modules (`process`, `http`, `fs`, `crypto`). It has no npm packages, no Express and no database.

## Requirements

- Node.js 18 or newer. Nothing to install.

## Project structure

```
smart-utility-toolkit/
├── calculator.js    # CLI calculator (process.argv)
├── app.js           # reuses custom modules + shows execution order
├── server.js        # HTTP server with routing (http)
├── fileManager.js   # create / read / update / delete files (fs)
├── dice.js          # dice roller (crypto)
├── test.txt         # sample file for the file manager
├── modules/
│   ├── isEven.js    # custom module
│   └── logger.js    # custom module: timestamps + ANSI colours
├── views/           # HTML templates used by server.js
├── public/
│   └── style.css
└── README.md
```

## 1. CLI calculator

```
node calculator.js add 10 5     # Result: 15
node calculator.js sub 10 5     # Result: 5
node calculator.js mul 10 5     # Result: 50
node calculator.js div 10 5     # Result: 2
node calculator.js mod 10 3     # Result: 1   (bonus)
node calculator.js pow 2 8      # Result: 256 (bonus)
node calculator.js help
```

Unknown operations, missing arguments, non-numbers and division by zero print an error and exit with code 1.

## 2. Custom modules

`modules/isEven.js` and `modules/logger.js` are exported with `module.exports` and pulled in with `require()` by `app.js`, `calculator.js`, `dice.js` and `server.js`.

```
node app.js            # checks a default list of numbers
node app.js 4 7 12     # checks your own numbers
```

`app.js` also prints the order Node runs sync code, `process.nextTick`, promises, I/O callbacks, `setTimeout` and `setImmediate`.

## 3. HTTP server

```
node server.js                       # http://localhost:3000
$env:PORT=4000; node server.js       # custom port (PowerShell)
```

| Route | Response |
|---|---|
| `GET /` | Welcome page |
| `GET /about` | About page |
| `GET /contact` | Contact page with a form |
| `POST /contact` | Validates the form, saves it to `messages.txt` |
| `GET /tools` | Calculator, isEven and dice in the browser |
| `GET /api/calc?op=add&a=10&b=5` | JSON result |
| `GET /api/is-even?n=42` | JSON result |
| `GET /api/dice?count=3` | JSON result |
| `GET /api/status` | Uptime, memory, Node version |
| anything else | 404 page (or JSON 404 under `/api`) |

A known path with the wrong method returns `405` and an `Allow` header. Every request is logged in the terminal with method, URL, status and time taken.

## 4. File manager

```
node fileManager.js                          # full demo
node fileManager.js create notes.txt Hello
node fileManager.js read test.txt
node fileManager.js update notes.txt More text
node fileManager.js delete notes.txt
```

Uses `writeFile`, `readFile`, `appendFile` and `unlink`. A missing file prints `File not found` instead of crashing. Only `.txt` files in the project folder can be touched.

Demo output:

```
Creating File... (demo.txt)
File Created
Reading File (demo.txt)
Hello Node.js
File Updated
Reading File (demo.txt)
Hello Node.js
Learning FS Module
File Deleted
```

## 5. Dice roller

```
node dice.js             # 🎲 Dice Rolled: 4
node dice.js 5           # five rolls in a loop, plus total and average
node dice.js --history   # last 10 saved rolls
```

Uses `crypto.randomInt(1, 7)`. Every roll is appended to `dice-history.txt` (bonus).

## 6. Execution flow

All utilities log before and after major operations through `modules/logger.js`. Each log line has a timestamp and a colour per level. Set `NO_COLOR=1` to turn colours off.

## Bonus challenges done

- Coloured terminal output with ANSI escape codes
- Timestamps in the logger module
- Extra calculator operations (`mod`, `pow`, plus word aliases)
- Dice roll history saved to a text file
