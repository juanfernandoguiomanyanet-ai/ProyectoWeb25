const db = require('../config/database');

function pad(number) {
  return number.toString().padStart(4, '0');
}

function generateId(counterName, prefix) {
  return new Promise((resolve, reject) => {

    db.get(
      "SELECT value FROM counters WHERE name = ?",
      [counterName],
      (err, row) => {

        if (err) return reject(err);

        if (!row) {
          db.run(
            "INSERT INTO counters (name, value) VALUES (?, ?)",
            [counterName, 1],
            function(err) {
              if (err) return reject(err);
              resolve(prefix + pad(1));
            }
          );
        } else {

          const newValue = row.value + 1;

          db.run(
            "UPDATE counters SET value = ? WHERE name = ?",
            [newValue, counterName],
            function(err) {
              if (err) return reject(err);
              resolve(prefix + pad(newValue));
            }
          );
        }
      }
    );
  });
}

module.exports = generateId;