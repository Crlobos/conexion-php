let tabla;

$(document).ready(function() {
    $.fn.dataTable.ext.errMode = 'none'; // Cambiar el modo de manejo de errores

    // Agregar manejador de errores global para Ajax
    $(document).ajaxError(function(event, jqxhr, settings, thrownError) {
        console.error('Error Ajax global:', thrownError);
        console.error('Estado:', jqxhr.status);
        console.error('Respuesta:', jqxhr.responseText);
    });

    // Depuración: Obtener datos directamente antes de inicializar DataTables
    $.ajax({
        url: 'obtener_atenciones.php',
        type: 'GET',
        success: function(response) {
            console.log('Respuesta directa:', response);
        },
        error: function(xhr, status, error) {
            console.error('Error al obtener datos:', error);
            console.error('Respuesta:', xhr.responseText);
        }
    });

    tabla = $('#tablaAtenciones').DataTable({
        "ajax": {
            "url": "obtener_atenciones.php",
            "type": "GET",
            "dataSrc": function(json) {
                // Verificar si hay datos
                if (!json || !json.data) {
                    console.error('Respuesta inválida:', json);
                    return [];
                }
                return json.data;
            },
            "error": function(xhr, error, thrown) {
                console.error('Error en Ajax:', error);
                console.error('Respuesta del servidor:', xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar datos',
                    text: 'No se pudieron cargar los datos. Por favor, intente nuevamente.'
                });
            }
        },
        "columns": [
            {"data": "id"},
            {"data": "fecha_ingreso"},
            {"data": "paciente"},
            {"data": "medico"},
            {"data": "especialidad"},
            {"data": "actividad"},
            {"data": "diagnostico"},
            {"data": "fecha_alta"},
            {
                "data": null,
                "defaultContent": "",
                "render": function(data, type, row) {
                    return `
                        <button class="btn btn-primary btn-sm editar-btn" data-id="${row.id}">
                            Editar
                        </button>
                        <button class="btn btn-danger btn-sm eliminar-btn" data-id="${row.id}">
                            Eliminar
                        </button>
                    `;
                }
            }
        ],
        "language": {
            "url": "//cdn.datatables.net/plug-ins/1.13.5/i18n/es-ES.json",
            "emptyTable": "No hay datos disponibles",
            "zeroRecords": "No se encontraron resultados",
            "loadingRecords": "Cargando...",
            "processing": "Procesando..."
        },
        "processing": true,
        "serverSide": false,
        "responsive": true,
        "pageLength": 10,
        "order": [[1, "desc"]],
        "dom": 'Bfrtip',
        "buttons": ['copy', 'csv', 'excel', 'pdf', 'print']
    }).on('error.dt', function(e, settings, techNote, message) {
        console.error('Error en DataTables:', message);
        Swal.fire({
            icon: 'error',
            title: 'Error en la tabla',
            text: 'Ha ocurrido un error al cargar los datos'
        });
    });

    // Manejar el envío del formulario
    $('#atencionForm').on('submit', function(e) {
        e.preventDefault();
        
        if (!validarFormulario()) {
            Swal.fire('Error', 'Por favor, complete todos los campos requeridos', 'error');
            return;
        }

        let id = $('#atencionId').val();
        let formData = new FormData(this);
        
        if (id) {
            formData.set('id', id);
        }

        console.log("ID al enviar:", id);
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + pair[1]);
        }

        $.ajax({
            url: id ? 'actualizar_atencion.php' : 'guardar_atencion.php',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                console.log('Respuesta del servidor:', response);
                try {
                    let res = JSON.parse(response);
                    if (res.success) {
                        Swal.fire({
                            icon: 'success',
                            title: '¡Éxito!',
                            text: 'Operación realizada correctamente'
                        });
                        $('#atencionForm')[0].reset();
                        $('#atencionId').val('');
                        $('button[type="submit"]').text('Guardar');
                        tabla.ajax.reload();
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: res.message || 'Error en la operación'
                        });
                    }
                } catch (e) {
                    console.error('Error al parsear respuesta:', e);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al procesar la respuesta del servidor'
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error('Error AJAX:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error en la comunicación con el servidor'
                });
            }
        });
    });

    // Agregar validación en tiempo real
    $('#atencionForm input, #atencionForm textarea').on('input', function() {
        if ($(this).prop('required')) {
            if (!$(this).val()) {
                $(this).addClass('is-invalid');
            } else {
                $(this).removeClass('is-invalid');
            }
        }
    });

    // Manejar clic en botón editar
    $(document).on('click', '.editar-btn', function() {
        let id = $(this).data('id');
        editarAtencion(id);
    });

    // Manejar clic en botón eliminar
    $(document).on('click', '.eliminar-btn', function() {
        let id = $(this).data('id');
        eliminarAtencion(id);
    });
});

function editarAtencion(id) {
    console.log("ID recibido para editar:", id);

    $.ajax({
        url: 'obtener_atencion.php',
        type: 'GET',
        data: { id: id },
        success: function(response) {
            try {
                let atencion = JSON.parse(response);
                console.log("Datos recibidos:", atencion);

                $('#atencionId').val(id);
                $('#fechaIngreso').val(atencion.fecha_ingreso);
                $('#paciente').val(atencion.paciente);
                $('#medico').val(atencion.medico);
                $('#especialidad').val(atencion.especialidad);
                $('#actividad').val(atencion.actividad);
                $('#diagnostico').val(atencion.diagnostico);
                $('#alta').val(atencion.fecha_alta);
                
                $('button[type="submit"]').text('Actualizar');
                
                console.log("ID establecido en el formulario:", $('#atencionId').val());
            } catch (e) {
                console.error('Error al parsear respuesta:', e);
                Swal.fire('Error', 'Error al cargar los datos de la atención', 'error');
            }
        },
        error: function(xhr, status, error) {
            console.error('Error AJAX:', error);
            console.error('Status:', status);
            console.error('Response:', xhr.responseText);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la comunicación con el servidor. Status: ' + status
            });
        }
    });
}

function eliminarAtencion(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "No podrás revertir esta acción",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: 'eliminar_atencion.php',
                type: 'POST',
                data: { id: id },
                success: function(response) {
                    try {
                        let res = JSON.parse(response);
                        if (res.success) {
                            Swal.fire({
                                icon: 'success',
                                title: '¡Éxito!',
                                text: 'Atención eliminada correctamente'
                            });
                            tabla.ajax.reload();
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: res.message || 'Error al eliminar la atención'
                            });
                        }
                    } catch (e) {
                        console.error('Error al parsear respuesta:', e);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error al procesar la respuesta del servidor'
                        });
                    }
                },
                error: function(xhr, status, error) {
                    console.error('Error AJAX:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error en la comunicación con el servidor. Status: ' + status
                    });
                }
            });
        }
    });
}

function validarFormulario() {
    let isValid = true;

    $('#atencionForm input, #atencionForm textarea').each(function() {
        if ($(this).prop('required') && !$(this).val()) {
            isValid = false;
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });

    return isValid;
}