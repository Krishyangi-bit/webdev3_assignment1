// fileManager.js
// CRUD on text files with the fs module (callback API).
//
//   node fileManager.js                          -> full demo (create, read, update, read, delete)
//   node fileManager.js create notes.txt Hello
//   node fileManager.js read notes.txt
//   node fileManager.js update notes.txt More text
//   node fileManager.js delete notes.txt

const fs = require('fs');
const path = require('path');
const logger = require('./modules/logger');

// Only .txt files inside this folder can be touched, so the
// project's own source files can never be overwritten by accident.
function resolveFile(name) {
  if (!name) throw new Error('Please provide a file name, e.g. notes.txt');
  const base = path.basename(name);
  if (path.extname(base).toLowerCase() !== '.txt') {
    throw new Error('Only .txt files can be managed (protects the project source files)');
  }
  return path.join(__dirname, base);
}

function explain(err) {
  if (err.code === 'ENOENT') return 'File not found. Create it first.';
  if (err.code === 'EACCES' || err.code === 'EPERM') return 'Permission denied';
  return err.message;
}

// Small helper so each operation validates the name the same way.
function withFile(name, done, action) {
  let file;
  try {
    file = resolveFile(name);
  } catch (err) {
    logger.error(err.message);
    return done(err);
  }
  action(file, path.basename(file));
}

function createFile(name, content, done = () => {}) {
  withFile(name, done, (file, base) => {
    logger.info(`Creating File... (${base})`);
    fs.writeFile(file, content, 'utf8', (err) => {
      if (err) {
        logger.error(`Could not create ${base}: ${explain(err)}`);
        return done(err);
      }
      logger.success('File Created');
      done(null);
    });
  });
}

function readFile(name, done = () => {}) {
  withFile(name, done, (file, base) => {
    logger.info(`Reading File (${base})`);
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        logger.error(`Could not read ${base}: ${explain(err)}`);
        return done(err);
      }
      console.log(data);
      done(null, data);
    });
  });
}

function updateFile(name, content, done = () => {}) {
  withFile(name, done, (file, base) => {
    // appendFile would silently create a missing file, so check first.
    fs.access(file, (missing) => {
      if (missing) {
        logger.error(`Could not update ${base}: ${explain(missing)}`);
        return done(missing);
      }
      logger.info(`Updating File (${base})`);
      fs.appendFile(file, `\n${content}`, 'utf8', (err) => {
        if (err) {
          logger.error(`Could not update ${base}: ${explain(err)}`);
          return done(err);
        }
        logger.success('File Updated');
        done(null);
      });
    });
  });
}

function deleteFile(name, done = () => {}) {
  withFile(name, done, (file, base) => {
    logger.info(`Deleting File (${base})`);
    fs.unlink(file, (err) => {
      if (err) {
        logger.error(`Could not delete ${base}: ${explain(err)}`);
        return done(err);
      }
      logger.success('File Deleted');
      done(null);
    });
  });
}

// Runs async steps one after another, stopping at the first error.
function runSteps(steps, onDone) {
  let i = 0;
  const next = (err) => {
    if (err || i === steps.length) return onDone(err);
    steps[i++](next);
  };
  next();
}

function runDemo() {
  const name = 'demo.txt';
  logger.info('fs CRUD demo started');

  runSteps(
    [
      (next) => createFile(name, 'Hello Node.js', next),
      (next) => readFile(name, next),
      (next) => updateFile(name, 'Learning FS Module', next),
      (next) => readFile(name, next),
      (next) => deleteFile(name, next),
    ],
    (err) => {
      if (err) return logger.error('Demo stopped early');
      logger.info('Now reading the deleted file to show missing-file handling:');
      readFile(name, () => logger.success('Demo finished without crashing'));
    }
  );

  // Printed before "File Created" because fs.writeFile is asynchronous.
  logger.warn('This line prints before "File Created": fs calls are asynchronous');
}

function runCli([command = 'demo', name, ...rest]) {
  const text = rest.join(' ');
  const fail = (err) => {
    if (err) process.exitCode = 1;
  };

  switch (command) {
    case 'demo':
      return runDemo();
    case 'create':
      return createFile(name, text, fail);
    case 'read':
      return readFile(name, fail);
    case 'update':
      return updateFile(name, text, fail);
    case 'delete':
      return deleteFile(name, fail);
    default:
      logger.error(`Unknown command "${command}"`);
      console.log('Commands: demo | create <file> <text> | read <file> | update <file> <text> | delete <file>');
      process.exitCode = 1;
  }
}

if (require.main === module) {
  runCli(process.argv.slice(2));
}

module.exports = { createFile, readFile, updateFile, deleteFile };
