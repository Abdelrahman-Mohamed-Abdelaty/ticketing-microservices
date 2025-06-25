import request from 'supertest'
import {app} from '../../app'

const createTicket = async () => {
    await request(app)
        .post('/api/tickets')
        .send({
            title: 'test',
            price: 10,
        })
        .set('Cookie',signin())
}
it('can fetch all tickets', async () => {
    await createTicket();
    await createTicket();
    await createTicket();

    const res = await request(app)
        .get('/api/tickets')
        .send()

    expect(res.status).not.toEqual(401);
    expect(res.body.length).toEqual(3);
})



