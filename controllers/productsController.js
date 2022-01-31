const { db, dbQuery } = require('../config/database');

module.exports = {
    getProducts: async (req, res) => {
        try {// Filter dengan cara looping object
            let filterQuery = []
            for (let prop in req.query) {
                if (prop != '_sort' && prop != '_order') {
                    // Cara 1 : price_min & price_max harus diisi

                    // if (prop != 'price_min' && prop != 'price_max') {
                    //     filterQuery.push(`${prop == 'name' ? `p.${prop}` : prop}=${db.escape(req.query[prop])}`)
                    // }

                    // Cara 2 : price_min atau price_max salah diisi

                    if (prop == 'price_min' || prop == 'price_max') {
                        if (req.query[prop]) {
                            filterQuery.push(`price ${prop == 'price_min' ? '>' : '<'} ${db.escape(req.query[prop])}`)
                        }
                    } else {
                        filterQuery.push(`${prop == 'name' ? `p.${prop}` : prop}=${db.escape(req.query[prop])}`)
                    }


                }
            }
            let { _sort, _order, status, price_min, price_max } = req.query
            let getSql = `Select p.*, b.brand, c.category from products p JOIN brand b on p.idbrand = b.idbrand JOIN category c on p.idcategory = c.idcategory WHERE p.status =${status ? `${db.escape(status)}` : `'Active'`} ${filterQuery.length > 0 ? `AND ${filterQuery.join(" AND ")}` : ''}${_sort && _order ? `ORDER BY ${_sort} ${_order}` : ''} ;`
            // Filter dengan query/kondisi
            // let getSql = `Select p.*, b.name as brand_name, c.category from products p JOIN brand b on p.idbrand = b.idbrand JOIN category c on p.idcategory = c.idcategory
            //             ${req.query.id ? `WHERE idproduct = ${req.query.id}` : ''} ${req.query.name ? `WHERE p.name LIKE '${req.query.name}%'` : ''} ${req.query.category ? `WHERE c.category LIKE '${req.query.category}%'` : ''}`
            let resultsProducts = await dbQuery(getSql)
            let resultsImages = await dbQuery(`select * from images`);
            let resultsStocks = await dbQuery(`select * from stocks`);
            console.log('Before', filterQuery)
            console.log('After', filterQuery.join(' AND '))
            console.log('Combined Script', getSql);
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
            if (req.dataUser.role == 'admin') {
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
                    // Cara 2
                    // for(let i = 0 ; i< images.length; i++){
                    //     await dbQuery(`Insert into images values (null,${insertProducts.insertId},${db.escape(images[i])});`)
                    // }
                    // Cara 3
                    // await dbQuery(`Insert into images values ${req.body.images.map(val =>`(null,${insertProducts.insertId},${db.escape(val)})`)}`)
                    res.status(200).send(insertProducts)
                }
            } else {
                res.status(401).send({
                    success: false,
                    message: 'You cant access this API ⚠️'
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    },
    deleteProduct: async (req, res) => {
        try {
            if (req.dataUser.role == 'admin') {
                let deleteSql = `UPDATE commerce.products SET status = 'Deleted' WHERE idproduct = ${db.escape(req.params.id)}`
                let deleteProduct = await dbQuery(deleteSql)
                res.status(200).send(deleteProduct)
            } else {
                res.status(401).send({
                    success: false,
                    message: 'You cant access this API ⚠️'
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    },
    editProduct: async (req, res) => {
        try {
            if (req.dataUser.role == 'admin') {
                let { images, stock } = req.body
                let editSql = `UPDATE commerce.products SET name ='${req.body.name}',idbrand =${req.body.idbrand},idcategory =${req.body.idcategory},description ='${req.body.description}',price =${req.body.price} WHERE idproduct = ${db.escape(req.params.id)}`
                let editProduct = await dbQuery(editSql)
                for (let i = 0; i < images.length; i++) {
                    dbQuery(`UPDATE commerce.images SET url = '${images[i].url}' WHERE idimage = ${db.escape(images[i].idimage)};`)
                }
                for (let i = 0; i < stock.length; i++) {
                    dbQuery(`UPDATE commerce.stocks SET type = '${stock[i].type}',qty = ${stock[i].qty} WHERE idstock = ${db.escape(stock[i].idstock)};`)
                }
                // images.forEach(val=>{
                //     dbQuery(`UPDATE commerce.images SET url = '${val.url}' WHERE idimage = ${db.escape(val.idimage)};`)
                // })
                // stocks.forEach(val=>{
                //     dbQuery(`UPDATE commerce.images SET url = '${images[i].url}' WHERE idstock = ${db.escape(val.idstocks)};`)
                // })
                res.status(200).send(editProduct)
            } else {
                res.status(401).send({
                    success: false,
                    message: 'You cant access this API ⚠️'
                })
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({
                success: false,
                message: "Failed ❌",
                error: error
            })
        }
    },
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
    getBrand: async (req, res) => {
        try {
            let getBrand = `SELECT * FROM brand;`
            let resultsBrand = await dbQuery(getBrand)
            res.status(200).send({
                success: true,
                message: "Get Products Success ✅",
                dataBrand: resultsBrand,
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
    getCategory: async (req, res) => {
        try {
            let getCategory = `SELECT * FROM category`
            let resultsCategory = await dbQuery(getCategory)
            res.status(200).send({
                success: true,
                message: "Get Products Success ✅",
                dataCategory: resultsCategory,
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

    }
}