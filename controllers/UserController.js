const User = require('../models/User');

const UserController = {
  // Método para cambiar el rol de un usuario
  async changeUserRole(req, res) {
    const { uid } = req.params;
    const { role } = req.body;

    try {
      // Buscar al usuario por su ID
      const user = await User.findById(uid);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Actualizar el rol del usuario
      user.role = role;
      await user.save();

      res.status(200).json({ message: 'Rol de usuario actualizado correctamente' });
    } catch (error) {
      console.error('Error al cambiar el rol del usuario:', error);
      res.status(500).json({ message: 'Se produjo un error al procesar la solicitud' });
    }
  }
};

module.exports = UserController;
