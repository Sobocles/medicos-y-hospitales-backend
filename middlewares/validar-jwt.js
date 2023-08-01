const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');



const validarJWT = (req, res, next) => {

    // Leer el Token
    const token = req.header('x-token');

    if ( !token ) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }

    try {
        
        const { uid } = jwt.verify( token, process.env.JWT_SECRET );
        req.uid = uid;

        next();

    } catch (error) {
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido'
        });
    }
 
}
//Valida si el usuario tiene privilegios para hacer determinada accion (por ejemplo cambiar de rol a otro usuario siendo USER ROL (no se puede))
const varlidarADMIN_ROLE = async(req, res, next)  => {

    const uid = req.uid;
    
    try {
        
        const usuarioDB = await Usuario.findById(uid);

        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no existe'
            });
        }
        //Si ES USER_ROL NO PUEDE HACER ESO
        if ( usuarioDB.role !== 'ADMIN_ROLE' ) {
            return res.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso'
            });
        }

        next();


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}
//funcionalidad que se utiliza  En el caso de que el usuario logeado (USER_ROLE) pueda actualizar su propia informacion de perfil sin ser bloqueado por falta de privilegios (ya que es su informacion de perfil) 
const varlidarADMIN_ROLE_o_MismoUsuario = async(req, res, next)  => {

    const uid = req.uid; //id del usuario logeado
    const id  = req.params.id; //id que se envia desde el front-end que se quiere actualizar
    
    try {
        
        const usuarioDB = await Usuario.findById(uid);

        if ( !usuarioDB ) {
            return res.status(404).json({
                ok: false,
                msg: 'Usuario no existe'
            });
        }
        /*
            En el caso de que el usuario no sea ADMIN ROL deberia ser bloquedo
            y decir que no tiene privilegios para realizar cierta accion
            pero dado que el id que se quiere modificar y el id del usuario son el mismo
            quiere decir que el usuario esta intentando cambiar su propia informacion de perfil
            por lo tanto se le deja pasar al next
        */
        if ( usuarioDB.role === 'ADMIN_ROLE' || uid === id ) { 
        
            next();
            
        } else {
            return res.status(403).json({
                ok: false,
                msg: 'No tiene privilegios para hacer eso'
            });
        }

        


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        })
    }

}




module.exports = {
    validarJWT,
    varlidarADMIN_ROLE,
    varlidarADMIN_ROLE_o_MismoUsuario
}