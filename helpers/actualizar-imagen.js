const Usuario = require('../models/usuario');
const fs = require('fs');

const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

const borrarImagen = ( path ) => {
    if ( fs.existsSync( path ) ) { //Si existe el path quiere decir que ya hay una imagen que el usuario esta tratando de actualizar por lo tanto la borra
        // borrar la imagen anterior
        fs.unlinkSync( path );
    }
}


const actualizarImagen = async(tipo, id, nombreArchivo) => {

    let pathViejo = '';
    
    switch( tipo ) {
        case 'medicos':
            const medico = await Medico.findById(id);
            if ( !medico ) {
                console.log('No es un médico por id');
                return false;
            }

            pathViejo = `./uploads/medicos/${ medico.img }`; //Se especifica el path donde se queire que se guarde la imagen el cual debe ser el mismo donde estaba la imagen anterior para que la borre y ocupe ese path
            borrarImagen( pathViejo );

            medico.img = nombreArchivo; //Se le incluye el nuevo nombre de la imagen
            await medico.save(); // se guarda el nuevo nombre de la imagen en la base de datos
            return true;

        break;
        
        case 'hospitales':
            const hospital = await Hospital.findById(id);
            if ( !hospital ) {
                console.log('No es un hospital por id');
                return false;
            }

            pathViejo = `./uploads/hospitales/${ hospital.img }`;
            borrarImagen( pathViejo );

            hospital.img = nombreArchivo;
            await hospital.save();
            return true;

        break;
        
        case 'usuarios':

            const usuario = await Usuario.findById(id);
            if ( !usuario ) {
                console.log('No es un usuario por id');
                return false;
            }

            pathViejo = `./uploads/hospitales/${ usuario.img }`;
            borrarImagen( pathViejo );

            usuario.img = nombreArchivo;
            await usuario.save();
            return true;

        break;
    }


}



module.exports = { 
    actualizarImagen
}
