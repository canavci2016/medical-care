import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskStatus } from './entities/task.entity';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MISSING_ID = '00000000-0000-4000-8000-000000000000';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();
    service = module.get(TasksService);
  });

  describe('TaskStatus enum', () => {
    it('has string values equal to names', () => {
      expect(TaskStatus.OPEN).toBe('OPEN');
      expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
      expect(TaskStatus.DONE).toBe('DONE');
    });
  });

  describe('create', () => {
    it('creates a task with a UUID and defaults', () => {
      const task = service.create({ title: 'Write tests' });
      expect(task.id).toMatch(UUID_RE);
      expect(task).toEqual({
        id: task.id,
        title: 'Write tests',
        description: '',
        status: TaskStatus.OPEN,
      });
    });

    it('respects provided description and status', () => {
      const task = service.create({
        title: 't',
        description: 'd',
        status: TaskStatus.DONE,
      });
      expect(task.description).toBe('d');
      expect(task.status).toBe(TaskStatus.DONE);
    });

    it('generates unique ids', () => {
      const a = service.create({ title: 'a' });
      const b = service.create({ title: 'b' });
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('findAll', () => {
    it('returns empty array initially', () => {
      expect(service.findAll()).toEqual([]);
    });

    it('returns all created tasks', () => {
      const a = service.create({ title: 'a' });
      const b = service.create({ title: 'b' });
      const all = service.findAll();
      expect(all).toHaveLength(2);
      expect(all).toEqual(expect.arrayContaining([a, b]));
    });
  });

  describe('findOne', () => {
    it('returns the task by id', () => {
      const a = service.create({ title: 'a' });
      expect(service.findOne(a.id)).toEqual(a);
    });

    it('throws NotFoundException for missing id', () => {
      expect(() => service.findOne(MISSING_ID)).toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('partially updates only provided fields', () => {
      const a = service.create({ title: 'a', description: 'desc' });
      const updated = service.update(a.id, { status: TaskStatus.IN_PROGRESS });
      expect(updated).toEqual({
        id: a.id,
        title: 'a',
        description: 'desc',
        status: TaskStatus.IN_PROGRESS,
      });
      expect(service.findOne(a.id)).toEqual(updated);
    });

    it('does not change the id', () => {
      const a = service.create({ title: 'a' });
      const updated = service.update(a.id, { title: 'b' });
      expect(updated.id).toBe(a.id);
      expect(updated.title).toBe('b');
    });

    it('throws NotFoundException for missing id', () => {
      expect(() => service.update(MISSING_ID, { title: 'x' })).toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes the task', () => {
      const a = service.create({ title: 'a' });
      const b = service.create({ title: 'b' });
      service.remove(a.id);
      expect(() => service.findOne(a.id)).toThrow(NotFoundException);
      expect(service.findAll()).toEqual([b]);
    });

    it('throws NotFoundException for missing id', () => {
      expect(() => service.remove(MISSING_ID)).toThrow(NotFoundException);
    });
  });
});
