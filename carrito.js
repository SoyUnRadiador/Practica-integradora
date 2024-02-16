class Carrito {
    constructor() {
        this.Carritos = [];
        this.UltimoID = 0;
    }

    // Función para crear un nuevo carrito
    crearCarrito(usuario, productos) {
        this.UltimoID++;
        const nuevoCarrito = {
            ID: this.UltimoID,
            Products: [],
        };
        
        // Verificar si el usuario es premium
        if (usuario.role === 'premium') {
            // Filtrar los productos que no pertenecen al usuario premium
            productos = productos.filter(producto => producto.owner !== usuario.email);
        }
        
        nuevoCarrito.Products = productos;
        this.Carritos.push(nuevoCarrito);
        return nuevoCarrito;
    }

    // Función para obtener productos de un carrito específico
    obtenerCarritoPorId(cartId) {
        const carrito = this.Carritos.find(c => c.ID === cartId);
        return carrito ? carrito.Products : [];
    }
}

module.exports = Carrito;
