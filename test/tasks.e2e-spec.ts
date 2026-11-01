import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { TasksModule } from './../src/tasks/tasks.module';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const createTask = (body: object) => http().post('/tasks').send(body);

  describe('happy path CRUD', () => {
    it('POST /tasks creates with defaults (201)', async () => {
      const res = await createTask({ title: 'First' }).expect(201);
      expect(res.body).toEqual({
        id: expect.stringMatching(UUID_RE),
        title: 'First',
        description: '',
        status: 'OPEN',
      });
    });

    it('POST /tasks accepts description and status', async () => {
      const res = await createTask({
        title: 'T',
        description: 'D',
        status: 'IN_PROGRESS',
      }).expect(201);
      expect(res.body).toMatchObject({
        title: 'T',
        description: 'D',
        status: 'IN_PROGRESS',
      });
    });

    it('full lifecycle: create, list, get, patch, delete', async () => {
      expect((await http().get('/tasks').expect(200)).body).toEqual([]);

      const { body: created } = await createTask({ title: 'Life' }).expect(
        201,
      );

      const list = await http().get('/tasks').expect(200);
      expect(list.body).toEqual([created]);

      const one = await http().get(`/tasks/${created.id}`).expect(200);
      expect(one.body).toEqual(created);

      const patched = await http()
        .patch(`/tasks/${created.id}`)
        .send({ status: 'DONE' })
        .expect(200);
      expect(patched.body).toEqual({ ...created, status: 'DONE' });

      const del = await http().delete(`/tasks/${created.id}`).expect(204);
      expect(del.text).toBe('');

      await http().get(`/tasks/${created.id}`).expect(404);
      expect((await http().get('/tasks').expect(200)).body).toEqual([]);
    });

    it('PATCH with empty body leaves task unchanged', async () => {
      const { body: created } = await createTask({ title: 'Same' });
      const res = await http()
        .patch(`/tasks/${created.id}`)
        .send({})
        .expect(200);
      expect(res.body).toEqual(created);
    });
  });

  describe('validation', () => {
    it('400 when title missing', () =>
      createTask({ description: 'x' }).expect(400));

    it('400 when title empty', () => createTask({ title: '' }).expect(400));

    it('400 when title is not a string', () =>
      createTask({ title: 123 }).expect(400));

    it('400 when title longer than 100 chars', () =>
      createTask({ title: 'a'.repeat(101) }).expect(400));

    it('201 when title exactly 100 chars', () =>
      createTask({ title: 'a'.repeat(100) }).expect(201));

    it('400 when description longer than 500 chars', () =>
      createTask({ title: 't', description: 'a'.repeat(501) }).expect(400));

    it('400 when status invalid', () =>
      createTask({ title: 't', status: 'BOGUS' }).expect(400));

    it('400 on PATCH with invalid status', async () => {
      const { body: created } = await createTask({ title: 't' });
      await http()
        .patch(`/tasks/${created.id}`)
        .send({ status: 'BOGUS' })
        .expect(400);
    });

    it('400 on PATCH with empty title', async () => {
      const { body: created } = await createTask({ title: 't' });
      await http()
        .patch(`/tasks/${created.id}`)
        .send({ title: '' })
        .expect(400);
    });

    it('PATCH with null title does not null out the title', async () => {
      const { body: created } = await createTask({ title: 't' });
      const res = await http()
        .patch(`/tasks/${created.id}`)
        .send({ title: null });
      if (res.status === 200) {
        expect(res.body.title).toBe('t');
      } else {
        expect(res.status).toBe(400);
      }
    });

    it('400 on POST with null description or status', async () => {
      await createTask({ title: 't', description: null }).expect(400);
      await createTask({ title: 't', status: null }).expect(400);
    });

    it('400 on PATCH with null description or status', async () => {
      const { body: created } = await createTask({ title: 't' });
      await http()
        .patch(`/tasks/${created.id}`)
        .send({ description: null })
        .expect(400);
      await http()
        .patch(`/tasks/${created.id}`)
        .send({ status: null })
        .expect(400);
    });

    it('400 when title is whitespace only (POST and PATCH)', async () => {
      await createTask({ title: '   ' }).expect(400);
      const { body: created } = await createTask({ title: 't' });
      await http()
        .patch(`/tasks/${created.id}`)
        .send({ title: '   ' })
        .expect(400);
    });

    it('trims surrounding whitespace from title', async () => {
      const res = await createTask({ title: '  padded  ' }).expect(201);
      expect(res.body.title).toBe('padded');
    });

    it('strips unknown fields (including client-supplied id)', async () => {
      const res = await createTask({
        title: 't',
        hacker: true,
        id: MISSING_ID,
      }).expect(201);
      expect(res.body).not.toHaveProperty('hacker');
      expect(res.body.id).not.toBe(MISSING_ID);
      expect(res.body.id).toMatch(UUID_RE);
    });

    it('strips unknown fields on PATCH', async () => {
      const { body: created } = await createTask({ title: 't' });
      const res = await http()
        .patch(`/tasks/${created.id}`)
        .send({ extra: 'x', id: MISSING_ID })
        .expect(200);
      expect(res.body).toEqual(created);
    });
  });

  describe('not found', () => {
    it('GET 404', () => http().get(`/tasks/${MISSING_ID}`).expect(404));
    it('PATCH 404', () =>
      http().patch(`/tasks/${MISSING_ID}`).send({ title: 'x' }).expect(404));
    it('DELETE 404', () => http().delete(`/tasks/${MISSING_ID}`).expect(404));
  });

  describe('bad UUID', () => {
    it('GET 400', () => http().get('/tasks/not-a-uuid').expect(400));
    it('PATCH 400', () =>
      http().patch('/tasks/not-a-uuid').send({ title: 'x' }).expect(400));
    it('DELETE 400', () => http().delete('/tasks/not-a-uuid').expect(400));
  });
});
