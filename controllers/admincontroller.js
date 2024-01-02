
const Product = require('../models/product');
const removeAccent = require('../util/removeAccent');
const label = require('../models/label');
const order_db = require('../models/order');
const user_db = require('../models/user');
const session = require('express-session');
const { name } = require('ejs');
const path = require('path');
const ProductCategory = require('../models/productCategory');
const multer = require('multer');
const { Console } = require('console');

exports.login = (req, res, next) => {
    try {

        const { taikhoan, password } = req.body;


        const user = 'admin';
        const pass = 'admin';

        if (taikhoan == user && password == pass) {
            if (!req.session) {
                req.session = {};
            }

            req.session.taikhoan = taikhoan;
            res.redirect('/admin');
        } else {
            // Incorrect username or password
            res.render('admin/login/index', {
                success_msg: '',
                errors: 'Incorrect username or password',
            });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

};
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {

            res.redirect('/admin/login');
        }
    });
}

exports.sanpham = async (req, res, next) => {
    try {
        const taikhoan = req.session.taikhoan;
        const products = Product.find().then(

            products => {

                res.render('admin/product/danhsach', {
                    success_msg: '',
                    errors: '',
                    products,
                    taikhoan
                });
            }
        );


    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
exports.themsp = (req, res, next) => {
    try {
        const taikhoan = req.session.taikhoan;
        const cate = Product.find().then(

            cate => {
                res.render('admin/product/them', {
                    success_msg: '',
                    errors: '',
                    cate,
                    taikhoan
                })

            })
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define the destination folder where files will be stored
        cb(null, 'public/images/product/');
    },
    filename: function (req, file, cb) {
        // Define the filename for the uploaded file
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

exports.themspmoi = async (req, res, next) => {
    try {
        // Use the configured multer middleware to handle file upload
        upload.single('images')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                console.error(err);
                res.status(500).send('Multer Error');
            } else if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {

                const { Name, description, stock, price, size, productType, color, pattern, tags, materials } = req.body;
                const sizeWithoutSpaces = size.replace(/\s/g, '');
                const colorWithoutSpaces = color.replace(/\s/g, '');
                const image = req.file.filename;
                console.log(Name, description, stock, price, size, productType, color, pattern, image, tags, materials);
                const newProduct = new Product({
                    name: Name,
                    description: description,
                    stock: stock,
                    price: price,
                    size: sizeWithoutSpaces.split(','),
                    productType: { main: productType },
                    color: colorWithoutSpaces.split(','),
                    pattern: pattern,
                    images: image,
                    tags: tags.split(','),
                    materials: materials,
                });
                newProduct.save()
                    .then((savedProduct) => {
                        console.log("Sản phẩm đã được thêm:", savedProduct);
                    })
                    .catch((error) => {
                        console.error("Lỗi khi thêm sản phẩm:", error);
                    });
                res.redirect('/admin/product/danh-sach.html');
            }
        });
    } catch (error) {
        // Handle errors, e.g., render an error page or log the error
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};





exports.suasanpham = async (req, res, next) => {
    try {
        const taikhoan = req.session.taikhoan;
        const productId = req.params.productId;

        const product = await Product.findById(productId);
        if (!product) {
            // Handle case where product with given ID is not found
            res.status(404).send('Product not found');
            return;
        }

        // Render the edit form with product details
        res.render('admin/product/suasp', {
            success_msg: '',
            errors: '',
            product,
            taikhoan,
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
exports.suasanphampost = async (req, res, next) => {
    try {

        upload.single('images')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                console.error(err);
                res.status(500).send('Multer Error');
            } else if (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            } else {
                let image;
                const productId = req.params.productId;
                const { name, description, stock, price, size, productType, color, pattern, tags, materials } = req.body;
                const sizeWithoutSpaces = size.replace(/\s/g, '');
                const colorWithoutSpaces = color.replace(/\s/g, '');

                if (req.file && req.file.filename) {
                    const image = req.file.filename;
                    console.log(name, description, stock, price, size, productType, color, pattern, image, tags, materials);
                    const result = await Product.updateOne(
                        { _id: productId },
                        {
                            $set:
                            {
                                name: name,
                                description: description,
                                stock: stock,
                                price: price,
                                size: sizeWithoutSpaces.split(','),
                                productType: { main: productType },
                                color: colorWithoutSpaces.split(','),
                                pattern: pattern,
                                images: req.file.filename,
                                tags: tags.split(','),
                                materials: materials,
                            }
                        });
                    if (result.nModified === 0) {
                        return res.status(404).send('Product not found');
                    }
                    else {
                        // Handle success

                        res.redirect('/admin/product/danh-sach.html');
                    }
                } else {
                    console.log(name, description, stock, price, size, productType, color, pattern, image, tags, materials);
                    const data = await Product.findById(productId)

                    const result = await Product.updateOne(
                        { _id: productId },
                        {
                            $set:
                            {
                                name: name,
                                description: description,
                                stock: stock,
                                price: price,
                                size: sizeWithoutSpaces.split(','),
                                productType: { main: productType },
                                color: colorWithoutSpaces.split(','),
                                pattern: pattern,
                                images: data.images,
                                tags: tags.split(','),
                                materials: materials,
                            }
                        });
                    if (result.nModified === 0) {
                        return res.status(404).send('Product not found');
                    }
                    else {
                        // Handle success
                        console.log(req.params.images)
                        res.redirect('/admin/product/danh-sach.html');
                    }
                }



            }
        });
    } catch (error) {
        // Handle errors, e.g., render an error page or log the error
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

};


exports.xoasp = async (req, res) => {
    try {
        const productId = req.params.productId;
        const filter = { _id: productId };
        const result = await Product.deleteOne(filter);

        console.log(`${result.deletedCount} document deleted.`);
        res.redirect('/admin/product/danh-sach.html')
    }
    catch (error) {
        console.error(`Error dropping database: ${error}`);
    }
};


exports.order = (req, res, next) => {
    try {
        const taikhoan = req.session.taikhoan;
        const orders = order_db.find().populate('user', 'firstName lastName').then(

            orders => {

                res.render('admin/cart/danhsach', {
                    success_msg: '',
                    errors: '',
                    order_cart: orders,
                    taikhoan
                })
            })
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

};


exports.xemhang = async (req, res, next) => {
    try {
        const taikhoan = req.session.taikhoan;
        try {
            const orderId = req.params.orderId;
            const order_cart1 = await order_db.findById(orderId).populate('user').exec();

            let itemDataArray = [];

            // Check if items is an object, if so, convert its values to an array
            if (order_cart1.cart.items && typeof order_cart1.cart.items === 'object') {
                itemDataArray = Object.values(order_cart1.cart.items).map(item => item.item);
            }



            res.render('admin/cart/view.ejs', {
                taikhoan,
                success_msg: '',
                errors: '',
                order_cart: itemDataArray,
                donhang: order_cart1,

            });
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};
exports.xacnhandon = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log(orderId)
        const result = await order_db.updateOne(
            { _id: orderId },
            {
                $set:
                {
                    tinhtrang: 'chờ vận chuyển',
                }
            });
        if (result.nModified === 0) {
            return res.status(404).send('Product not found');
        }
        else {


            res.redirect('back');
        }

    } catch (error) {

    }
};
exports.hoanthanh = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        console.log(orderId)
        const result = await order_db.updateOne(
            { _id: orderId },
            {
                $set:
                {
                    tinhtrang: 'Giao thành công',
                }
            });
        if (result.nModified === 0) {
            return res.status(404).send('Product not found');
        }
        else {


            res.redirect('back');
        }

    } catch (error) {

    }
}
exports.xoaorder = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const filter = { _id: orderId };
        const result = await order_db.deleteOne(filter);

        console.log(`${result.deletedCount} document deleted.`);
        res.redirect('/admin/cart/danh-sach.html')
    }
    catch (error) {
        console.error(`Error dropping database: ${error}`);
    }
}
