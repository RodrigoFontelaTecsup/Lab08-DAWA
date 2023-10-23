const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Esquema de Usuario
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

// Modelo del Usuario en base al esquema anterior
const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users });
});

// Validar datos de entrada
const validateData = [
  body('name')
    .isLength({ min: 8 })
    .withMessage('Ingresa un nombre válido (mínimo 8 caracteres)'),
  body('email').isEmail().withMessage('Ingresa un email válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Ingresa una contraseña válida (mínimo 8 caracteres)'),
];

// Ruta para mostrar mensajes de error para la validacion de cada campo
router.post('/', validateData, async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const users = await User.find();
    const errorMessages = errors.array().map((error) => error.msg);
    res.render('index', { validationErrors: errorMessages, users });
  } else {
    const { name, email, password } = req.body;

    // Encriptacion de la contrasena ingresada
    const saltRounds = 10;
    bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
      if (err) {
        console.error('Error al encriptar la contraseña:', err);
        res.status(500).json({ error: 'Error al crear el usuario' });
      } else {
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.redirect('/users');
      }
    });
  }
});

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/users');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
