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

describe("GET /invoices", function() {
    it("should get a list invoices", async function() {
        const response = await request(app).get("/invoices");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "invoices": [
                {
                    "id": 1,
                    "comp_code": "apple"
                },
                {
                    "id": 2,
                    "comp_code": "apple"
                },
                {
                    "id": 3,
                    "comp_code": "ibm"
                }
            ]
        });
    });
});

describe("GET /invoices/:id", function() {
    it("should get invoice info with a valid id", async function() {
        const response = await request(app).get("/invoices/1");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "invoice": {
                    "id":1,
                    "amt":100,
                    "paid":false,
                    "add_date": '2018-01-01T08:00:00.000Z',
                    "paid_date":null,
                    "company": {
                        "code": "apple",
                        "name": "Apple",
                        "description": "Maker of OSX."
                    }
                }
        });
    })

    it("should return an error for an invalid id", async function() {
        const response = await request(app).get("/invoices/999");
        expect(response.statusCode).toBe(404);
    })
});

describe("POST /invoices", function() {
    it("should create a new invoice with valid input", async function() {
        const data = {
            comp_code: "ibm",
            amt: 200
        }
        let response = await request(app).post("/invoices").send(data);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            invoice: {id: 4, 
                add_date: expect.any(String),
                paid: false,
                paid_date: null,
                ...data}
        })

        response = await request(app).get("/invoices");
        expect(response.body.invoices.length).toBe(4);
    })

    it("should return 400 for missing comp_code", async function() {
        const data = {
            amt: 200
        }
        let response = await request(app).post("/invoices").send(data);
        expect(response.statusCode).toBe(400);
    })

    it("should return 400 for missing name", async function() {
        const data = {
            comp_code: "ibm"
        }
        let response = await request(app).post("/invoices").send(data);
        expect(response.statusCode).toBe(400);
    })

    it("should return 400 if amount not greater than 0", async function() {
        const data = {
            comp_code: "ibm",
            amt: -1
        }
        const response = await request(app).post("/invoices").send(data);
        expect(response.statusCode).toBe(400);
    })

    it("should return 400 if comp_code is of company that isn't in database", async function() {
        const data = {
            comp_code: "badcompany",
            amt: 100
        }
        let response = await request(app).post("/invoices").send(data);
        expect(response.statusCode).toBe(400);
    })
})

describe("PUT /invoices/:id", function() {
    it("should update invoice with valid data", async function() {
        const data = {
            amt: 201
        }
        let response = await request(app).put("/invoices/1").send(data);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            invoice: {
                "id":1,
                "amt":201,
                "paid":false,
                "add_date": '2018-01-01T08:00:00.000Z',
                "paid_date":null,
                "comp_code":"apple"
        }})

        response = await request(app).get("/invoices/1")
        expect(response.body.invoice.amt).toBe(201)
    })

    it("should return 400 if amt missing", async function() {
        const response = await request(app).put("/invoices/1");
        expect(response.statusCode).toBe(400);
    })

    it("should return 400 if amt not greater than 0", async function() {
        const response = await request(app).put("/invoices/1").send({amt:-1});
        expect(response.statusCode).toBe(400);
    })

    it("should return 404 if invalid invoice id", async function() {
        const data = {
            amt: 201
        }
        const response = await request(app).put("/invoices/999").send(data);
        expect(response.statusCode).toBe(404);
    })
})

describe("DELETE /invoices/:id", function() {
    it("should delete an existing invoice", async function() {
        let response = await request(app).delete("/invoices/1");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({status:"deleted"})

        response = await request(app).get("/invoices");
        expect(response.body.invoices.length).toBe(2);
    })

    it("should return 404 if invoice id doesn't exist", async function() {
        const response = await request(app).delete("/invoices/999");
        expect(response.statusCode).toBe(404);
    })
})