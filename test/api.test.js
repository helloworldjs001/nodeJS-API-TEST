const request = require('supertest');
const app = require('../server');

describe('Users API', () => {
    let token;
    let expect;

    before(async () => {
        ({ expect } = await import('chai'));

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'alice@example.com', password: 'password1' });
        token = res.body.token;
    });

    it('should login a user and return a token', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'alice@example.com', password: 'password1' });
        expect(res.statusCode).to.equal(200); // Use `.equal` instead of `.toEqual`
        expect(res.body).to.have.property('token');
    });

    it('should return 401 for invalid password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'alice@example.com', password: 'wrongpassword' });
        expect(res.statusCode).to.equal(401);
        expect(res.text).to.equal('Invalid password');
    });

    it('should return all users if authenticated', async () => {
        const res = await request(app)
            .get('/api/users')
            .set('x-access-token', token);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.lengthOf(2);
    });

    it('should return 403 if no token is provided', async () => {
        const res = await request(app).get('/api/users');
        expect(res.statusCode).to.equal(403);
        expect(res.text).to.equal('No token provided');
    });

    it('should create a new user with valid data', async () => {
        const newUser = { name: 'Charlie', email: 'charlie@example.com', password: 'password3' };
        const res = await request(app)
            .post('/api/users')
            .set('x-access-token', token)
            .send(newUser);
        expect(res.statusCode).to.equal(201);
        expect(res.body).to.have.property('id');
        expect(res.body).to.have.property('name', 'Charlie');
    });

    it('should return 400 for invalid user data', async () => {
        const invalidUser = { name: '', email: 'invalid-email', password: '123' };
        const res = await request(app)
            .post('/api/users')
            .set('x-access-token', token)
            .send(invalidUser);
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.have.property('errors');
    });

    it('should return 404 if user not found', async () => {
        const res = await request(app)
            .get('/api/users/99')
            .set('x-access-token', token);
        expect(res.statusCode).to.equal(404);
        expect(res.text).to.equal('User not found');
    });

    it('should update an existing user', async () => {
        const updatedUser = { name: 'Alice Updated', email: 'alice.updated@example.com', password: 'newpassword' };
        const res = await request(app)
            .put('/api/users/1')
            .set('x-access-token', token)
            .send(updatedUser);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('name', 'Alice Updated');
    });

    it('should return 404 if trying to update a non-existent user', async () => {
        const updatedUser = { name: 'Nonexistent', email: 'nonexistent@example.com', password: 'password' };
        const res = await request(app)
            .put('/api/users/99')
            .set('x-access-token', token)
            .send(updatedUser);
        expect(res.statusCode).to.equal(404);
        expect(res.text).to.equal('User not found');
    });

    it('should delete a user', async () => {
        const res = await request(app)
            .delete('/api/users/1')
            .set('x-access-token', token);
        expect(res.statusCode).to.equal(204);
    });

    it('should return 404 if trying to delete a non-existent user', async () => {
        const res = await request(app)
            .delete('/api/users/99')
            .set('x-access-token', token);
        expect(res.statusCode).to.equal(404);
        expect(res.text).to.equal('User not found');
    });
});
