const request = require('supertest');
const app = require('../server'); // Adjust the path as necessary

describe('Resource API', () => {
    let expect;

    before(async () => {
        // Dynamically import `chai` and destructure `expect`
        ({ expect } = await import('chai'));
    });

    it('should retrieve all resources', async () => {
        const res = await request(app).get('/resource');
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
    });

    it('should retrieve a specific resource by ID', async () => {
        const res = await request(app).get('/resource/1');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name', 'Resource 1');
    });

    it('should return 404 for a non-existent resource ID', async () => {
        const res = await request(app).get('/resource/99');
        expect(res.status).to.equal(404);
        expect(res.body).to.have.property('error', 'Resource not found');
    });

    it('should create a new resource', async () => {
        const newResource = { name: 'Resource 3', type: 'Type C' };
        const res = await request(app)
            .post('/resource')
            .send(newResource);
        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('id');
    });

    it('should update an existing resource', async () => {
        const updatedResource = { name: 'Updated Resource', type: 'Updated Type' };
        const res = await request(app)
            .put('/resource/1')
            .send(updatedResource);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Resource updated');
    });

    it('should return 404 for updating a non-existent resource', async () => {
        const updatedResource = { name: 'Non-existent Resource', type: 'Non-existent Type' };
        const res = await request(app)
            .put('/resource/99')
            .send(updatedResource);
        expect(res.status).to.equal(404);
        expect(res.body).to.have.property('error', 'Resource not found');
    });

    it('should delete a specific resource', async () => {
        const res = await request(app).delete('/resource/1');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Resource deleted');
    });

    it('should return 404 for deleting a non-existent resource', async () => {
        const res = await request(app).delete('/resource/99');
        expect(res.status).to.equal(404);
        expect(res.body).to.have.property('error', 'Resource not found');
    });

    it('should access a secure resource with valid authorization', async () => {
        const res = await request(app)
            .get('/secure-resource')
            .set('Authorization', 'Bearer valid_token');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Secure Resource Accessed');
    });

    it('should return 401 for unauthorized access', async () => {
        const res = await request(app)
            .get('/secure-resource')
            .set('Authorization', 'Bearer invalid_token');
        expect(res.status).to.equal(401);
        expect(res.body).to.have.property('error', 'Unauthorized');
    });

    it('should retrieve a resource in XML format', async () => {
        const res = await request(app).get('/xml-resource');
        expect(res.status).to.equal(200);
        expect(res.headers['content-type']).to.include('application/xml'); // Update to check for inclusion
        expect(res.text).to.include('<resource>');
    });
    
});
