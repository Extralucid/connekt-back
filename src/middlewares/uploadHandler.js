import  multer from 'multer';
const IMG_PATH = './public/images/';
const DOC_PATH = './public/doc/';
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            cb(null, `${IMG_PATH}`);
        }else{
            cb(null, `${DOC_PATH}`);
        }
        
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-"+file.originalname);
    }
});
export const upload = multer({
    limits: {
        fileSize: 2 * 1024 * 1024
    },
    fileFilter: (req, file, cb)=>{
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|doc|docx|pdf|xls|xlsx)$/)) {
            return cb(new Error("Seules ces extensions (jpg|jpeg|png|gif|doc|docx|pdf|xls|xlsx) sont permises!!"), false);
        }
        cb(null, true);
    },
    storage: storage
});
