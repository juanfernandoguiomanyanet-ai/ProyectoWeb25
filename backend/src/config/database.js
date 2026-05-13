const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error conectando a SQLite:', err.message);
    } else {
        console.log('SQLite conectado correctamente');
    }
});

// ================================
// CREACIÓN DE TABLAS
// ================================

db.serialize(() => {

    // PRODUCTOS
    db.run(`
  CREATE TABLE IF NOT EXISTS productos (
    id TEXT PRIMARY KEY,
    nombre TEXT,
    categoria_id TEXT,
    precio REAL,
    costo REAL,
    stock INTEGER,
    imagen TEXT
  )
`);

    // CLIENTES
    db.run(`
    CREATE TABLE IF NOT EXISTS clientes (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      direccion TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // PROVEEDORES
    db.run(`
    CREATE TABLE IF NOT EXISTS proveedores (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      telefono TEXT,
      email TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // VENTAS
    db.run(`
    CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY,
      cliente_id TEXT,
      total REAL NOT NULL,
      metodo_pago TEXT,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
  `);

    // COMPRAS
    db.run(`
    CREATE TABLE IF NOT EXISTS compras (
      id TEXT PRIMARY KEY,
      proveedor_id TEXT,
      total REAL NOT NULL,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
    )
  `);

});

module.exports = db;

// Tabla Detalle de Ventas
db.run(`
  CREATE TABLE IF NOT EXISTS ventas_detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venta_id TEXT,
    producto_id TEXT,
    cantidad INTEGER,
    precio_unitario REAL,
    subtotal REAL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )
`);
// Tabla Detalle de Compras
db.run(`
  CREATE TABLE IF NOT EXISTS compras_detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    compra_id TEXT,
    producto_id TEXT,
    cantidad INTEGER,
    costo_unitario REAL,
    subtotal REAL,
    FOREIGN KEY (compra_id) REFERENCES compras(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )
`);
db.run(`
  CREATE TABLE IF NOT EXISTS counters (
    name TEXT PRIMARY KEY,
    value INTEGER
  )
`);