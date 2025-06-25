import request from 'supertest';
import {app} from '../../app';

it('should return a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@gmail.com',
      password: 'password',
    })
    .expect(201);
})

it('should returns a 400 if email is invalid', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'testgmail.com',
            password: 'password',
        })
        .expect(400);
})
it('should returns a 400 if password is invalid', async () => {
    return request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@gmail.com',
            password: 'a',
        })
        .expect(400);
})
it('should returns a 400 if email or password are missed', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@gmail.com',
            password: '',
        })
        .expect(400);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: '',
            password: 'password',
        })
        .expect(400);
})

it('should disallow duplicate emails', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(201);

    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(400);
})
it('should set a cookie after successful signup', async () => {
    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();

})