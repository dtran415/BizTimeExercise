const express = require("express")
const ExpressError = require("../expressError")
const db = require("../db")

let router = new express.Router()

router.get("/", async (req, res, next) => {
    try {
        const result = await db.query('SELECT id, comp_code FROM invoices')
        return res.json({invoices: result.rows})
    } catch (e) {
        next(e)
    }
})

router.get("/:id(\\d+)", async (req, res, next) => {
    try {
        const {id} = req.params
        const result = await db.query(`SELECT id, amt, paid, add_date, paid_date, code, name, description
        FROM invoices i LEFT JOIN companies c
        ON i.comp_code=c.code
        WHERE id=$1`, [id])

        if (result.rows.length == 0)
            throw new ExpressError(`Invalid ID: ${id}`, 404)

        const data = result.rows[0]
        const {code, name, description, ...invoice} = data;
        const company = {code, name, description}
        invoice.company = company
        return res.json({invoice})
    } catch (e) {
        next(e)
    }
})

router.post("/", async (req, res, next) => {
    
    const {comp_code, amt} = req.body
    try {

        if (!comp_code || !amt )
            throw new ExpressError("comp_code, amt required", 400)

        if (amt <= 0)
            throw new ExpressError("amt must be greater than 0", 400)
        
        const result = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt])

        return res.status(201).json({"invoice": result.rows[0]})
    } catch (e) {
        if (e.code === "23503") // foreign key violation
            return next(new ExpressError(`Invalid comp code: ${comp_code}`, 400))
        next(e)
    }
})

router.put("/:id(\\d+)", async (req, res, next) => {
    try {
        const {id} = req.params
        const {amt} = req.body

        if (!amt || amt <= 0)
            throw new ExpressError("amt must be greater than 0", 400)

        const result = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id])

        if (result.rows.length == 0)
            throw new ExpressError(`Invalid ID: ${id}`, 404)

        const {...invoice} = result.rows[0]
        return res.json({invoice})
    } catch (e) {
        next(e)
    }
})

router.delete("/:id(\\d+)", async (req, res, next) => {
    try {
        const {id} = req.params

        const result = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id`, [id])

        if (result.rows.length === 0)
            throw new ExpressError(`Invalid id: ${id}`, 404)

        return res.json({"status":"deleted"})
    } catch (e) {
        next(e)
    }
})

module.exports = router