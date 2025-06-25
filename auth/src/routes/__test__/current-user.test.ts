import request from 'supertest';
import {app} from '../../app';

it('respond with details of the current user', async () => {
    const cookie = await signin();
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .set('Cookie',cookie)
        .expect(200);
    expect(response.body.currentUser.email).toEqual('test@test.com');
})

it('respond with null if user is not signed in', async () => {
    const response = await request(app)
        .get('/api/users/currentuser')
        .send()
        .expect(200);
    expect(response.body.currentUser).toBeNull();


})
