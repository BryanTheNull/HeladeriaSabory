//Libreria de Express
const express = require('express');
//Libreria Path
const path = require('path');
//Libreria Mysql
const mysql = require('mysql');
//Libreria para Imagen
const multer = require('multer');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'imagen')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'imagen');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'Heladeria'
});

//Verificacion de errores para validar si la conexion es correcta
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});

//Envio los datos del formulario por url
app.use(express.urlencoded({ extended: true }));
//Convierto en formato json
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));
//Recibo los valores y los envio a la tabla
app.post('/guardar_helado',(req, res) => {
    const { nombre, descripcion, sabor, tipo, cobertura, precio } = req.body;
    const sql = 'INSERT INTO Helado (nombre, descripcion, sabor, tipo, cobertura, precio, imagen) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, descripcion, sabor, tipo, cobertura, precio, Imagen], (err, result) => {
        if (err) throw err;
        console.log('Helado insertada correctamente.');
        res.redirect('/listardatos.html');
    });
});
//Ruta para mostrar las películas en el listardatos.html con metodo GET
app.get('/helados', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "peliculas"
    connection.query('SELECT * FROM Helado', (err, rows) => {
        //Maneja los errores, si los hay
        if (err) throw err;
        res.send(rows); //Aquí puedes enviar la respuesta como quieras (por ejemplo, renderizar un HTML o enviar un JSON)
    });
});
// Ruta para obtener los datos de una película por su ID
app.get('/helado_especifico/:id', (req, res) => {
    // Extraer el ID de los parámetros de la solicitud
    const id = req.params.id;
    // Ejecutar una consulta SQL para obtener los datos de la película con el ID proporcionado
    connection.query('SELECT * FROM Helado WHERE id = ?', [id], (err, result) => {
        if (err) {
            // Manejar el error si ocurre durante la consulta
            console.error('Error al obtener los datos de la película:', err);
            res.status(500).send('Error interno del servidor');
            return;
       }
      //Verificar si no se encontró ninguna película con el ID proporcionado
        if (result.length === 0) {
           res.status(404).send('Película no encontrada');
            return;
        }
       //  Enviar los datos de la película como respuesta en formato JSON
        res.json(result[0]);
    });
});

app.post('/guardar_helado', upload.single('imagen'), (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    const imagen = req.file.filename;

    if (!nombre || !descripcion || !precio || !stock || !imagen) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const sql = 'INSERT INTO Helado (nombre, descripcion, sabor, tipo, cobertura, precio, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, descripcion, sabor, tipo, cobertura, precio, imagen], (err, result) => {
        if (err) {
            console.error('Error al agregar Helado:', err);
            return res.status(500).json({ message: 'Error al agregar Helado.' });
        }
        return res.status(200).json({ message: 'Helado agregado correctamente.' });
    });
});

app.put('/modalmodificar/:id', upload.single('imagen'), (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock } = req.body;
    const imagen = req.file ? req.file.filename : req.body.imagen; // Aquí se determina la imagen a utilizar

    if (!nombre || !descripcion || !precio || !stock) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const sql = 'UPDATE Helado SET Nombre = ?, Descripcion = ?, Precio = ?, Stock = ?, Imagen = ? WHERE id= ?';
    connection.query(sql, [nombre, descripcion, precio, stock, imagen, id], (err, result) => {
        if (err) {
            console.error('Error al modificar helado:', err);
            return res.status(500).json({ message: 'Error al modificar helado.' });
        }
        return res.status(200).json({ message: 'Helado modificado correctamente.' });
    });
});


app.delete('/helados/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM Helado WHERE id = ?';
    connection.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar helado:', err);
            return res.status(500).json({ message: 'Error al eliminar helado.' });
        }
        return res.status(200).json({ message: 'helado eliminado correctamente.' });
    });
});

//REGISTRO DE USUARIO
//-----------------------------Registro de Usuario
app.post('/register', (req, res) => {
    const { nombre, apellido, email, contraseña } = req.body;
    if (!nombre || !apellido || !email || !contraseña) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const sql = 'INSERT INTO Usuarios (Nombre, Apellido, Email, Contraseña) VALUES (?, ?, ?, ?)';
    connection.query(sql, [nombre, apellido, email, contraseña], (err, result) => {
        if (err) {
            console.error('Error registrando usuario:', err);
            return res.status(500).json({ message: 'Error registrando usuario.' });
        }
        console.log('Usuario registrado correctamente.');
        return res.status(200).json({ message: 'Usuario registrado correctamente.' });
    });
});
//-----------------------------Login del Usuario
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    const sql = 'SELECT * FROM Usuarios WHERE Email = ? AND Contraseña = ?';
    connection.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error('Error al verificar usuario:', err);
            return res.status(500).json({ message: 'Error al verificar usuario.' });
        }

        if (results.length > 0) {
            return res.status(200).json({ message: 'Inicio de sesión exitoso.' });
        } else {
            return res.status(401).json({ message: 'Credenciales incorrectas.' });
        }
    });
});

//Servidor ejecutandose en el puerto 3000
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

