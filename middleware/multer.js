const multer = require('multer');

module.exports = {
    multerUpload: (directory = "/public", name = "PIMG") => {
        const storage = multer.diskStorage({

            destination: (req, file, cb) => {
                cb (null, directory);
            },
        
            filename: (req, file, cb) => {
                cb (
                    null,
                    name +
                    '-' +
                    Date.now() +
                    Math.round(Math.random() * 1000000000) +
                    '.' +
                    file.mimetype.split('/')[1]
                );
            }
        });
        
        const fileFilter = (req, file, cb) => {
        
            const extensionFilter = [ 'png', 'jpg', 'jpeg', 'gif' ];
            const checkExtension = extensionFilter.includes(file.mimetype.split('/')[1].toLowerCase());
            console.log(file.mimetype)
            
            if (!checkExtension) cb (new Error("File format must be in .png, .jpg, or .gif"))
            else cb (null, true)
        };

        const sizeLimit = 1024 * 1024;
        return multer({ storage, fileFilter, limits: { fileSize: sizeLimit } });
    }
}