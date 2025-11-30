import multer from "multer"
//handle the files upload with disk storage
//use disk storage of multer
const storage = multer.diskStorage({
    destination:function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({ storage })