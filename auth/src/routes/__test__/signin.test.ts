import request from 'supertest';
import {app} from '../../app';

it('should returns a 400 if email is not exist', async () => {
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(400);
})
it('should returns a 400 if password is incorrect', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(201);
    return request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@gmail.com',
            password: 'pasword',
        })
        .expect(400);
})

it('should respond with a cookie when given valid credentials', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(201);
    const response = await request(app)
        .post('/api/users/signin')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(200);
    expect(response.get('Set-Cookie')).toBeDefined();
})