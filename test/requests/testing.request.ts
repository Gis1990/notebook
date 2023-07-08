import request from 'supertest';

export class Testing {
  constructor(private readonly server: any) {}

  async deleteAll() {
    return request(this.server).delete('/testing/delete-all');
  }

  async getUser(data: string) {
    const response = await request(this.server).get(`/testing/users/${data}`);
    return response.body;
  }
}
