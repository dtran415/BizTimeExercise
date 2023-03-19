const express = require("express")
const ExpressError = require("../expressError")
const db = require("../db")
const slugify = require("slugify");

let router = new express.Router()

router.get("/", async (req, res, next) => {

    try {
        const result = await db.query('SELECT code, name FROM companies')
        return res.json({"companies": result.rows})
    } catch (e) {
        next(e)
    }
})

router.get("/:code", async (req, res, next) => {
    try {
        const code = req.params.code

        const result = await db.query('SELECT code, name, description, industry_code FROM companies c LEFT JOIN industry_company ic ON c.code=ic.comp_code WHERE code=$1', [code])

        if (result.rows.length === 0) 
            throw new ExpressError(`Company with code ${code} not found`, 404)

        const {industry_code, ...company} = result.rows[0]
        company.industries = result.rows.map(row => row.industry_code)
        
        return res.json({"company": company})
    } catch (e) {
        next(e)
    }
})

router.post("/", async (req, res, next) => {
    try {
        const {name, description} = req.body

        if (!name || ! description)
            throw new ExpressError("code, name, description required", 400)
        
        const code = slugify(name, {lower: true});
        const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description])

        return res.status(201).json({"company": result.rows[0]})
    } catch (e) {
        next(e)
    }
})

router.put("/:code", async (req, res, next) => {
    try {
        const code = req.params.code
        const {name, description} = req.body

        if (!name || !description)
            throw new ExpressError("name, description required", 400)

        const result = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code])

        if (result.rows.length === 0)
            throw new ExpressError(`Company with code ${code} not found`, 404)

        return res.json({"company":result.rows[0]})
    } catch (e) {
        next(e)
    }
})

router.delete("/:code", async (req, res, next) => {
    try {
        const code = req.params.code

        const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [code])

        if (result.rows.length === 0)
            throw new ExpressError(`Company with code ${code} not found`, 404)

        return res.json({"status":"deleted"})
    } catch (e) {
        next(e)
    }
})

module.exports = router