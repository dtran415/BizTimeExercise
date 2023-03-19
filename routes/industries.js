const express = require("express")
const ExpressError = require("../expressError")
const db = require("../db")

let router = new express.Router()

router.get("/", async (req, res, next) => {

    try {
        const result = await db.query('SELECT i.code, industry, ic.comp_code as company FROM industries i LEFT JOIN industry_company ic on i.code=ic.industry_code')

        const industryMap = new Map()
        for (let row of result.rows) {
            if (!industryMap.get(row.code))
                industryMap.set(row.code,[])

            if (row.company)
                industryMap.get(row.code).push(row.company)
        }

        const industries = []
        for (let [key, value] of industryMap) {
            industries.push({code: key, companies: value})
        }

        return res.json({"industries": industries})
    } catch (e) {
        next(e)
    }
})

router.post("/", async (req, res, next) => {
    try {
        const {code, industry} = req.body

        if (!code || !industry)
            throw new ExpressError("code, industry required", 400)
        
        const result = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry])

        return res.status(201).json({"industry": result.rows[0]})
    } catch (e) {
        next(e)
    }
})

module.exports = router