const express = require('express');
const router = express.Router();
const User = require('../models/User');
const saltRounds = 10;
const passport = require('passport');
const Carrito = require('../carrito');
//Recuperacion de contraseña
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

router.get('/register', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.render('register');
    }
  });

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/home');
    } else {
        res.render('login', { layout: 'loginLayout', showButtons: false });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca al usuario por su correo electrónico en la base de datos
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            // Si el usuario no existe o la contraseña es incorrecta, muestra un mensaje de error
            console.error('Credenciales incorrectas');
            return res.redirect('/login');
        }

        // Si las credenciales son correctas, establece la sesión del usuario
        req.session.user = {
            email: user.email,
            role: user.role // Si tienes un campo de 'role' en tu modelo de usuario
        };

        res.redirect('/home'); // Redirige a la página principal
    } catch (error) {
        console.error('Error al intentar iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión');
    }
});


// Ruta para el cierre de sesión
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/login');
        }
    });
  });

  
// Ruta para procesar el registro de un nuevo usuario
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Verifica si el correo electrónico ya está en uso
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).send('El correo electrónico ya está en uso');
        }

        // Crea un nuevo usuario con los datos proporcionados
        const newUser = new User({ name, email, password });
        await newUser.save(); // Guarda el nuevo usuario en la base de datos

        res.redirect('/login');
    } catch (error) {
        console.error('Error al registrar al usuario:', error);
        res.status(500).send('Error al registrar al usuario');
    }
});
  
const hashFromDatabase = '$2b$10$YourStoredHashHere';
const passwordAttempt = 'password123';

bcrypt.compare(passwordAttempt, hashFromDatabase, function(err, result) {
  if (err) {
    // Manejar el error
    console.error(err);
    return;
  }

  if (result) {
    // Contraseña correcta
    console.log('Contraseña correcta');
  } else {
    // Contraseña incorrecta
    console.log('Contraseña incorrecta');
  }
});


//GitHub

router.get(
    "/github",
    passport.authenticate("github", { scope: ["user:email"] }) 
  );

  router.get(
    "/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    async (req, res) => {
        req.session.user = req.user;
        res.redirect("/home");
    }
);

//Recuperacion de contraseña
// Configurar el transportador de correo electrónico
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


// Ruta para solicitar un restablecimiento de contraseña
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
  
        // Buscar al usuario por su dirección de correo electrónico
        const user = await User.findOne({ email });
  
        if (!user) {
            return res.status(404).json({ message: 'El correo electrónico proporcionado no está registrado' });
        }
  
        // Generar token de restablecimiento de contraseña
        const token = crypto.randomBytes(20).toString('hex');
        const expiresIn = Date.now() + 3600000; // Expira en 1 hora
        user.resetPasswordToken = token;
        user.resetPasswordExpires = expiresIn;
        await user.save();
  
        // Enviar correo electrónico con el enlace de restablecimiento de contraseña
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Restablecimiento de Contraseña',
            html: `<p>Hola ${user.first_name},</p>
                   <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para cambiar tu contraseña:</p>
                   <p><a href="http://tu_sitio_web.com/reset-password/${token}">Restablecer Contraseña</a></p>
                   <p>Este enlace expirará en 1 hora.</p>`
        });
  
        res.status(200).json({ message: 'Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña' });
    } catch (error) {
        console.error('Error al solicitar el restablecimiento de contraseña:', error);
        res.status(500).json({ message: 'Se produjo un error al procesar la solicitud' });
    }
  });
  
  // Ruta para restablecer la contraseña
  router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
  
        // Buscar al usuario por el token de restablecimiento de contraseña
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
  
        if (!user) {
            return res.status(400).json({ message: 'El enlace de restablecimiento de contraseña es inválido o ha expirado' });
        }
  
        // Verificar si la nueva contraseña es igual a la anterior
        const passwordMatch = await bcrypt.compare(newPassword, user.password);
        if (passwordMatch) {
            return res.status(400).json({ message: 'La nueva contraseña no puede ser la misma que la contraseña anterior' });
        }
  
        // Actualizar la contraseña del usuario
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
  
        res.status(200).json({ message: 'La contraseña se ha restablecido con éxito' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ message: 'Se produjo un error al procesar la solicitud' });
    }
  });


module.exports = router;
