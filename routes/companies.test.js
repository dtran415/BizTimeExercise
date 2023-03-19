process.env.NODE_ENV = "test";

const request = require("supertest");

const app = require("../app");
const db = require("../db");
const {createData} = require("../_test-common");

beforeEach(createData);

afterEach(() => {
    
});

afterAll(() => {
    db.end()
});

describe("GET /companies", function() {
    it("should get a list companies", async function() {
        const response = await request(app).get("/companies");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "companies": [
                {
                    "code": "apple",
                    "name": "Apple"
                },
                {
                    "code": "ibm",
                    "name": "IBM"
                }
            ]
        });
    });
});

describe("GET /companies/:code", function() {
    it("should get info for a company with a valid code", async function() {
        const response = await request(app).get("/companies/apple");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "company": {
                    "code": "apple",
                    "name": "Apple",
                    "description": "Maker of OSX.",
                    "industries": ["tech"]
                }
        });
    })

    it("should return an error for an invalid code", async function() {
        const response = await request(app).get("/companies/badcode");
        expect(response.statusCode).toBe(404);
    })
});

describe("POST /companies", function() {
    it("should create a new company with valid input", async function() {
        const company = {
            name: "ABC Company",
            description: "The ABC Company"
        }
        let response = await request(app).post("/companies").send(company);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            company: {code:"abc-company", ...company}
        })

        response = await request(app).get("/companies");
        expect(response.body.companies.length).toBe(3);
    })

    it("should return 400 for missing name", async function() {
        const company = {
            description: "The ABC Company"
        }
        const response = await request(app).post("/companies").send(company);
        expect(response.statusCode).toBe(400);
    })

    it("should return 400 for missing description", async function() {
        const company = {
            name: "ABC Company",
        }
        const response = await request(app).post("/companies").send(company);
        expect(response.statusCode).toBe(400);
    })
})

describe("PUT /companies/:code", function() {
    it("should update company with valid data", async function() {
        const company = {
            name: "IBM2",
            description: "Big Blue 2."
        }
        const response = await request(app).put("/companies/ibm").send(company);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            company: {code: "ibm", ...company}
        })
    })

    it("should return 400 if missing name", async function() {
        const company = {
            description: "Big Blue 2."
        }
        const response = await request(app).put("/companies/ibm").send(company);
        expect(response.statusCode).toBe(400);
    })

    it("should return 400 if missing description", async function() {
        const company = {
            name: "IBM2"
        }
        const response = await request(app).put("/companies/ibm").send(company);
        expect(response.statusCode).toBe(400);
    })

    it("should return 404 if invalid company code", async function() {
        const company = {
            name: "IBM2",
            description: "Big Blue 2."
        }
        const response = await request(app).put("/companies/ibm2").send(company);
        expect(response.statusCode).toBe(404);
    })
})

describe("DELETE /companies/:code", function() {
    it("should delete an existing company", async function() {
        let response = await request(app).delete("/companies/ibm");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({status:"deleted"})

        response = await request(app).get("/companies");
        expect(response.body.companies.length).toBe(1);
    })

    it("should return 404 if company doesn't exist", async function() {
        const response = await request(app).delete("/companies/badcompany");
        expect(response.statusCode).toBe(404);
    })
})