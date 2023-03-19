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

describe("GET /industries", function() {
    it("should get a list industries and companies for each industry", async function() {
        const response = await request(app).get("/industries");
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            "industries": [
                {
                    "code": "tech",
                    "companies": ["apple", "ibm"]
                },
                {
                    "code": "auto",
                    "companies": []
                }
            ]
        });
    });
});

describe("POST /industries", function() {
    it("should create a new industry with valid input", async function() {
        const data = {
            code: "energy",
            industry: "Energy"
        }
        let response = await request(app).post("/industries").send(data);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({
            industry: data
        })

        response = await request(app).get("/industries");
        expect(response.body.industries.length).toBe(3);
    })

    it("should return 400 for missing code", async function() {
        const data = {
            industry: "Energy"
        }
        let response = await request(app).post("/industries").send(data);
        expect(response.statusCode).toBe(400);
    })

    it("should return 400 for missing industry", async function() {
        const data = {
            code: "energy"
        }
        let response = await request(app).post("/industries").send(data);
        expect(response.statusCode).toBe(400);
    })
})