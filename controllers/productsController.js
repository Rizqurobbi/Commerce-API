const { db } = require('../config/database');

module.exports = {
    getProducts: (req, res, next) => {
        let getSql = `Select p.*, b.name as brand_name, c.category from products p JOIN brand b on p.idbrand=b.idbrand JOIN category c on p.idcategory = c.idcategory
        ${req.query.id ? `WHERE idproduct = ${req.query.id}` : ''};`
        db.query(getSql, (err, results) => {
            if (err) {
                res.status(500).send({
                    success: false,
                    message: "Failed ❌",
                    error: err
                })
            }
            let getImages = `SELECT * FROM images;`
            db.query(getImages, (errImg, resultsImg) => {
                if (err) {
                    res.status(500).send({
                        success: false,
                        message: "Failed ❌",
                        error: errImg
                    })
                } results.forEach((value, index) => {
                    value.images = []
                    resultsImg.forEach((val, idx) => {
                        if (value.idproduct == val.idproduct) {
                            delete val.idproduct
                            value.images.push(val)
                        }
                    })
                })
                let getStock = `SELECT * FROM stocks;`
                db.query(getStock, (errStock, resultsStock) => {
                    if (err) {
                        res.status(500).send({
                            success: false,
                            message: "Failed ❌",
                            error: errStock
                        })
                    }
                    results.forEach((value, index) => {
                        value.stock = []
                        resultsStock.forEach((val, idx) => {
                            if (value.idproduct == val.idproduct) {
                                delete val.idproduct
                                value.stock.push(val)
                            }
                        })
                    })
                    res.status(200).send({
                        success: true,
                        message: "Get Products Success ✅",
                        dataProducts: results,
                        error: ""
                    })
                })
                // let detailProduct = `Select * from users WHERE iduser=${db.escape(iduser)};`
                // db.query
            })
        })
    },
    addProduct: (req, res) => {
        let insertSQL =
            `Insert into products (idbrand,name,description,price) values
        (${db.escape(req.body.idbrand)},${db.escape(req.body.name)},${db.escape(req.body.description)},${db.escape(req.body.price)});`

        db.query(insertSQL, (err, results) => {
            if (err) {
                res.status(500).send(err);
            }
            res.status(200).send(results)
        })
    }
}