/* ============================================================
   SCRIPT PRINCIPAL - LEVELUP STORE (S6)
   ============================================================ */

// Variables globales
let productos = [];
let carrito = [];
let total = 0;

// Selección de elementos del DOM
const contenedorProductos = document.getElementById('contenedor-productos');
const cargando = document.getElementById('cargando');
const errorCarga = document.getElementById('error-carga');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarrito = document.getElementById('total-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const btnVaciarCarrito = document.getElementById('btn-vaciar-carrito');
const formBusqueda = document.getElementById('form-busqueda');
const inputBusqueda = document.getElementById('input-busqueda');
const mensajeBusqueda = document.getElementById('mensaje-busqueda');
const formNewsletter = document.getElementById('form-newsletter');
const mensajeCompra = document.getElementById('mensaje-compra');

// ============================================================
// FETCH API - Cargar productos desde JSON
// ============================================================

async function cargarProductos() {
    try {
        cargando.classList.remove('d-none');
        errorCarga.classList.add('d-none');

        const respuesta = await fetch('assets/data/productos.json');

        if (!respuesta.ok) {
            throw new Error(`Error HTTP: ${respuesta.status}`);
        }

        const datos = await respuesta.json();
        productos = datos.productos;

        renderizarProductos(productos);
        cargando.classList.add('d-none');

    } catch (error) {
        console.error('Error al cargar los productos:', error);
        cargando.classList.add('d-none');
        errorCarga.classList.remove('d-none');
    }
}

// ============================================================
// RENDERIZAR PRODUCTOS
// ============================================================

function renderizarProductos(listaProductos) {
    contenedorProductos.innerHTML = '';

    if (listaProductos.length === 0) {
        contenedorProductos.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted fs-5">No se encontraron productos.</p>
            </div>
        `;
        return;
    }

    listaProductos.forEach(producto => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';

        col.innerHTML = `
            <div class="card card-producto border-0 shadow-sm">
                <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x220/1e1e2f/ffc107?text=LevelUp'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${producto.nombre}</h5>
                    <p class="card-text text-muted small">${producto.descripcion}</p>
                    <div class="mt-auto d-flex justify-content-between align-items-center">
                        <span class="precio">$${producto.precio.toLocaleString('es-CL')}</span>
                        <div class="d-flex gap-1">
                            <button 
                                class="btn btn-outline-warning btn-sm btn-ver-detalle" 
                                data-id="${producto.id}"
                                data-bs-toggle="modal" 
                                data-bs-target="#modalProducto"
                                aria-label="Ver detalles de ${producto.nombre}">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button 
                                class="btn btn-warning btn-sm fw-bold btn-agregar" 
                                data-id="${producto.id}"
                                data-nombre="${producto.nombre}"
                                data-precio="${producto.precio}"
                                aria-label="Agregar ${producto.nombre} al carrito">
                                <i class="bi bi-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        contenedorProductos.appendChild(col);
    });

    asignarEventosAgregar();
    asignarEventosVerDetalle();
}

// ============================================================
// EVENTOS AGREGAR AL CARRITO
// ============================================================

function asignarEventosAgregar() {
    document.querySelectorAll('.btn-agregar').forEach(boton => {
        boton.addEventListener('click', () => {
            const id = parseInt(boton.getAttribute('data-id'));
            const nombre = boton.getAttribute('data-nombre');
            const precio = parseInt(boton.getAttribute('data-precio'));

            agregarAlCarrito(id, nombre, precio);

            const textoOriginal = boton.innerHTML;
            boton.innerHTML = '<i class="bi bi-check-lg"></i>';
            boton.classList.remove('btn-warning');
            boton.classList.add('btn-success');
            boton.disabled = true;

            setTimeout(() => {
                boton.innerHTML = textoOriginal;
                boton.classList.remove('btn-success');
                boton.classList.add('btn-warning');
                boton.disabled = false;
            }, 1000);
        });
    });
}

// ============================================================
// EVENTOS VER DETALLE (MODAL BOOTSTRAP)
// ============================================================

function asignarEventosVerDetalle() {
    document.querySelectorAll('.btn-ver-detalle').forEach(boton => {
        boton.addEventListener('click', () => {
            const id = parseInt(boton.getAttribute('data-id'));
            const producto = productos.find(p => p.id === id);

            if (producto) {
                document.getElementById('modalProductoLabel').textContent = producto.nombre;
                document.getElementById('modalProductoImagen').src = producto.imagen;
                document.getElementById('modalProductoImagen').alt = producto.nombre;
                document.getElementById('modalProductoDescripcion').textContent = producto.descripcion;
                document.getElementById('modalProductoPrecio').textContent = `$${producto.precio.toLocaleString('es-CL')}`;
            }
        });
    });
}

// ============================================================
// AGREGAR AL CARRITO
// ============================================================

function agregarAlCarrito(id, nombre, precio) {
    carrito.push({ id, nombre, precio });
    total += precio;
    guardarCarrito();
    actualizarCarrito();
}

// ============================================================
// ACTUALIZAR CARRITO
// ============================================================

function actualizarCarrito() {
    listaCarrito.innerHTML = '';

    if (carrito.length === 0) {
        listaCarrito.innerHTML = `
            <li class="list-group-item text-center text-muted">
                El carrito está vacío
            </li>
        `;
    } else {
        carrito.forEach((producto, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.innerHTML = `
                <span>
                    <strong>${producto.nombre}</strong> 
                    <span class="text-muted">- $${producto.precio.toLocaleString('es-CL')}</span>
                </span>
                <button class="btn-eliminar" data-index="${index}" aria-label="Eliminar ${producto.nombre}">
                    <i class="bi bi-x-circle-fill"></i>
                </button>
            `;
            listaCarrito.appendChild(li);
        });
    }

    totalCarrito.textContent = `Total: $${total.toLocaleString('es-CL')}`;
    contadorCarrito.textContent = carrito.length;
    asignarEventosEliminar();
}

// ============================================================
// EVENTOS ELIMINAR
// ============================================================

function asignarEventosEliminar() {
    document.querySelectorAll('.btn-eliminar').forEach(boton => {
        boton.addEventListener('click', () => {
            const index = parseInt(boton.getAttribute('data-index'));
            eliminarDelCarrito(index);
        });
    });
}

function eliminarDelCarrito(index) {
    total -= carrito[index].precio;
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarCarrito();
}

function vaciarCarrito() {
    carrito = [];
    total = 0;
    guardarCarrito();
    actualizarCarrito();
}

// ============================================================
// BUSCAR PRODUCTOS (EVENTO SUBMIT)
// ============================================================

function buscarProductos(e) {
    e.preventDefault();
    const termino = inputBusqueda.value.trim().toLowerCase();

    if (termino === '') {
        mensajeBusqueda.textContent = '';
        renderizarProductos(productos);
        return;
    }

    const resultados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(termino)
    );

    if (resultados.length > 0) {
        mensajeBusqueda.textContent = `Se encontraron ${resultados.length} resultado(s) para "${termino}".`;
        mensajeBusqueda.className = 'text-center text-success mt-2';
    } else {
        mensajeBusqueda.textContent = `No se encontraron resultados para "${termino}".`;
        mensajeBusqueda.className = 'text-center text-danger mt-2';
    }

    renderizarProductos(resultados);
}

// ============================================================
// NEWSLETTER (EVENTO SUBMIT)
// ============================================================

function procesarNewsletter(e) {
    e.preventDefault();
    alert('¡Gracias por suscribirte a nuestro newsletter!');
    e.target.reset();
}

// ============================================================
// FINALIZAR COMPRA (MODAL BOOTSTRAP)
// ============================================================

function finalizarCompra() {
    if (carrito.length === 0) {
        mensajeCompra.textContent = 'Tu carrito está vacío. Agrega productos antes de finalizar la compra.';
    } else {
        mensajeCompra.innerHTML = `
            ¡Gracias por tu compra!<br>
            <strong>Total: $${total.toLocaleString('es-CL')}</strong><br>
            <small class="text-muted">Recibirás un correo con los detalles.</small>
        `;
        setTimeout(() => {
            vaciarCarrito();
        }, 2000);
    }
}

// ============================================================
// LOCALSTORAGE
// ============================================================

function guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    localStorage.setItem('total', total);
}

function cargarCarritoGuardado() {
    const carritoGuardado = localStorage.getItem('carrito');
    const totalGuardado = localStorage.getItem('total');

    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        total = parseInt(totalGuardado) || 0;
        actualizarCarrito();
    }
}

// ============================================================
// EVENTOS GLOBALES
// ============================================================

formBusqueda.addEventListener('submit', buscarProductos);
formNewsletter.addEventListener('submit', procesarNewsletter);
btnVaciarCarrito.addEventListener('click', vaciarCarrito);


const modalCompra = document.getElementById('modalCompra');
modalCompra.addEventListener('show.bs.modal', finalizarCompra);

// ============================================================
// INICIALIZACIÓN
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    cargarCarritoGuardado();
    actualizarCarrito();
});
