import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './entities/task.entity';

const ID = '11111111-1111-4111-8111-111111111111';
const task: Task = {
  id: ID,
  title: 't',
  description: '',
  status: TaskStatus.OPEN,
} as Task;

describe('TasksController', () => {
  let controller: TasksController;
  const service = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [{ provide: TasksService, useValue: service }],
    }).compile();
    controller = module.get(TasksController);
  });

  it('create delegates to service.create', async () => {
    service.create.mockReturnValue(task);
    const dto = { title: 't' };
    await expect(Promise.resolve(controller.create(dto))).resolves.toEqual(
      task,
    );
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll delegates to service.findAll', async () => {
    service.findAll.mockReturnValue([task]);
    await expect(Promise.resolve(controller.findAll())).resolves.toEqual([
      task,
    ]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne delegates to service.findOne', async () => {
    service.findOne.mockReturnValue(task);
    await expect(Promise.resolve(controller.findOne(ID))).resolves.toEqual(
      task,
    );
    expect(service.findOne).toHaveBeenCalledWith(ID);
  });

  it('findOne propagates NotFoundException', () => {
    service.findOne.mockImplementation(() => {
      throw new NotFoundException();
    });
    expect(() => controller.findOne(ID)).toThrow(NotFoundException);
  });

  it('update delegates to service.update', async () => {
    const updated = { ...task, title: 'u' };
    service.update.mockReturnValue(updated);
    await expect(
      Promise.resolve(controller.update(ID, { title: 'u' })),
    ).resolves.toEqual(updated);
    expect(service.update).toHaveBeenCalledWith(ID, { title: 'u' });
  });

  it('remove delegates to service.remove', async () => {
    service.remove.mockReturnValue(undefined);
    await Promise.resolve(controller.remove(ID));
    expect(service.remove).toHaveBeenCalledWith(ID);
  });
});
