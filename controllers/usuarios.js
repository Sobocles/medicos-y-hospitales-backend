const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');


const getUsuarios = async(req, res) => {

    const desde = Number(req.query.desde) || 0;

    const [ usuarios, total ] = await Promise.all([
        Usuario
            .find({}, 'nombre email role google img')
            .skip( desde )
            .limit( 5 ),

        Usuario.countDocuments()
    ]);


    res.json({
        ok: true,
        usuarios,
        total
    });

}

const crearUsuario = async(req, res = response) => {

    const { email, password } = req.body;

    try {

        const existeEmail = await Usuario.findOne({ email });

        if ( existeEmail ) {
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya está registrado'
            });
        }

        const usuario = new Usuario( req.body );
    
        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync( password, salt );
    
    
        // Guardar usuario
        await usuario.save();

        // Generar el TOKEN - JWT
        const token = await generarJWT( usuario.id );


        res.json({
            ok: true,
            usuario,
            token
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado... revisar logs'
        });
    }


}


const actualizarUsuario = async (req, res = response) => {

    // TODO: Validar token y comprobar si es el usuario correcto

    const uid = req.params.id;


    try {

        const usuarioDB = await Usuario.findById( uid );

        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario por ese id'
            });
        }

        // Actualizaciones
        //Si se encuentra un usuario, se extraen los campos actualizados del cuerpo de la solicitud.
        const { email, ...campos } = req.body; //CON ESTO YA NO VIENEN LA PASSWORD Y GOOGLE Y EMAIL EN CAMPOS
      
        if ( usuarioDB.email !== email ) { /*Si el email que esta en la base de datos y el email que el usuario intenta actualizar son distintos, eso quiere dcir que el usuario esta intentando actualizar sus datos*/

            const existeEmail = await Usuario.findOne({ email }); /*Por lo tanto es necesario corroborar que es email que el usuario intenta cambiar no se encuentra en la base de datos*/
            if ( existeEmail ) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con ese email'
                });
            }
        }
        
        if ( !usuarioDB.google ){//Si el usuario que se intenta actualizae de la db no es de google
            campos.email = email;
        } else if ( usuarioDB.email !== email ) { //SI usuarioDB.email !== email QUIERE DECIR QUE EL USUARIO ESTA INTENTANDO CAMBIAR EL CORREO DE UN USUARIO YA AUTENTICADO DE GOOGL Y ESO NO DEBE SER PERMITIDO
            return res.status(400).json({
                ok: false,
                msg: 'Usuario de google no pueden cambiar su correo' //ESTE MENSAJE DE ERRROR SALTARIA CUANDO EL USUARIO LE HACE CLICK  A GUARDAR CAMBIOS LUEGO DE INTENTAR CAMBIAR EL CORREO DE GOOGLE
            });
        }

        const usuarioActualizado = await Usuario.findByIdAndUpdate( uid, campos, { new: true } );

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }

}


const borrarUsuario = async(req, res = response ) => {

    const uid = req.params.id;

    try {

        const usuarioDB = await Usuario.findById( uid );

        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario por ese id'
            });
        }

        await Usuario.findByIdAndDelete( uid );

        
        res.json({
            ok: true,
            msg: 'Usuario eliminado'
        });

    } catch (error) {
        
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });

    }


}



module.exports = {
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario
}