const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Specify the directory where uploaded files will be stored
        cb(null, "./public/admin/uploads"); // Create the 'uploads' directory in your project
    },
    filename: (req, file, cb) => {
        // Define the file name for the uploaded file
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploads = multer({ storage: storage });

module.exports = uploads;
