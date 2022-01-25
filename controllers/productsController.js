const { db, dbQuery } = require('../config/database');

module.exports = {
    getProducts: async (req, res) => {
        try {// Filter dengan cara looping object
            let filterQuery = []
            for (let prop in req.query) {
                filterQuery.push(`${prop == 'name' ? `p.${prop}` : prop}=${db.escape(req.query[prop])}`)
            }
            let getSql = `Select p.*, b.name as brand_name, c.category from products p JOIN brand b on p.idbrand = b.idbrand JOIN category c on p.idcategory = c.idcategory ${filterQuery.length > 0 ? `WHERE ${filterQuery.join(" AND ")}` : ''};`
            // Filter dengan query/kondisi
            // let getSql = `Select p.*, b.name as brand_name, c.category from products p JOIN brand b on p.idbrand = b.idbrand JOIN category c on p.idcategory = c.idcategory
            //             ${req.query.id ? `WHERE idproduct = ${req.query.id}` : ''} ${req.query.name ? `WHERE p.name LIKE '${req.query.name}%'` : ''} ${req.query.category ? `WHERE c.category LIKE '${req.query.category}%'` : ''}`
            let resultsProducts = await dbQuery(getSql)

            let resultsImages = await dbQuery(`select * from images`);
            let resultsStocks = await dbQuery(`select * from stocks`);
            resultsProducts.forEach((value, index) => {
                value.images = []
                value.stock = []
                resultsImages.forEach(val => {
                    if (value.idproduct == val.idproduct) {
                        delete val.idproduct
                        value.images.push(val)
                    }
                })
                resultsStocks.forEach(val => {
                    if (value.idproduct == val.idproduct) {
                        delete val.idproduct
                        value.stock.push(val)
                    }
                })
            })
            res.status(200).send({
                success: true,
                message: "Get Products Success ✅",
                dataProducts: resultsProducts,
                error: ""
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    },
    // getProducts: (req, res, next) => {
    //     let getSql = `Select p.*, b.name as brand_name, c.category from products p JOIN brand b on p.idbrand=b.idbrand JOIN category c on p.idcategory = c.idcategory
    //     ${req.query.id ? `WHERE idproduct = ${req.query.id}` : ''};`
    //     db.query(getSql, (err, results) => {
    //         if (err) {
    //             res.status(500).send({
    //                 success: false,
    //                 message: "Failed ❌",
    //                 error: err
    //             })
    //         }
    //         let getImages = `SELECT * FROM images;`
    //         db.query(getImages, (errImg, resultsImg) => {
    //             if (err) {
    //                 res.status(500).send({
    //                     success: false,
    //                     message: "Failed ❌",
    //                     error: errImg
    //                 })
    //             } results.forEach((value, index) => {
    //                 value.images = []
    //                 resultsImg.forEach((val, idx) => {
    //                     if (value.idproduct == val.idproduct) {
    //                         delete val.idproduct
    //                         value.images.push(val)
    //                     }
    //                 })
    //             })
    //             let getStock = `SELECT * FROM stocks;`
    //             db.query(getStock, (errStock, resultsStock) => {
    //                 if (err) {
    //                     res.status(500).send({
    //                         success: false,
    //                         message: "Failed ❌",
    //                         error: errStock
    //                     })
    //                 }
    //                 results.forEach((value, index) => {
    //                     value.stock = []
    //                     resultsStock.forEach((val, idx) => {
    //                         if (value.idproduct == val.idproduct) {
    //                             delete val.idproduct
    //                             value.stock.push(val)
    //                         }
    //                     })
    //                 })
    //                 res.status(200).send({
    //                     success: true,
    //                     message: "Get Products Success ✅",
    //                     dataProducts: results,
    //                     error: ""
    //                 })
    //             })
    //             // let detailProduct = `Select * from users WHERE iduser=${db.escape(iduser)};`
    //             // db.query
    //         })
    //     })
    // },
    addProduct: async (req, res) => {
        try {
            // untuk menyimpan data product
            // table yg berpengaruh adalah table products,images,stocks
            let { idbrand, idcategory, name, description, price, images, stocks } = req.body
            console.log(req.body)
            // let insertProducts = await dbQuery(`Insert into products values (null,${db.escape(idbrand)},${db.escape(idcategory)},${db.escape(name)},${db.escape(description)},${db.escape(price)},'Active');`)
            let insertProducts = await dbQuery(`Insert into products values (null, ${db.escape(idbrand)},
            ${db.escape(idcategory)}, ${db.escape(name)}, ${db.escape(description)}, ${db.escape(price)}, 'Active');`)
            // console.log(`Insert into products values (null,${db.escape(idbrand)},${db.escape(idcategory)},${db.escape(name)},${db.escape(description)},${db.escape(price)},'Active';`)
            if (insertProducts.insertId) {
                let images = [];
                let stock = []
                req.body.images.forEach(val => {
                    images.push(`(null,${db.escape(insertProducts.insertId)},${db.escape(val)})`)
                })
                await dbQuery(`Insert into images values ${images.join()}`)
                req.body.stock.forEach(val => {
                    stock.push(`(null,${db.escape(insertProducts.insertId)},${db.escape(val.type)},${db.escape(val.qty)})`)
                })
                await dbQuery(`Insert into stocks values ${stock.join()}`)
                res.status(200).send(insertProducts)
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    }
    // addProduct: (req, res) => {
    //     let insertSQL =
    //         `Insert into products (idbrand,name,description,price) values
    //     (${db.escape(req.body.idbrand)},${db.escape(req.body.name)},${db.escape(req.body.description)},${db.escape(req.body.price)});`

    //     db.query(insertSQL, (err, results) => {
    //         if (err) {
    //             res.status(500).send(err);
    //         }
    //         res.status(200).send(results)
    //     })
    // }
}