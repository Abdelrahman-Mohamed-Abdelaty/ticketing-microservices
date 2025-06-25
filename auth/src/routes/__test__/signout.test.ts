import request from 'supertest';
import {app} from '../../app';



it('should clear cookies after signing out', async () => {
    await request(app)
        .post('/api/users/signup')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(201);
    const response = await request(app)
        .post('/api/users/signout')
        .send({
            email: 'test@gmail.com',
            password: 'password',
        })
        .expect(200);

    const cookie = response.get("Set-Cookie");
    if (!cookie) {
        throw new Error("Expected cookie but got undefined.");
    }

    expect(cookie[0]).toEqual(
        "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
    );
})