import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './entities/task.entity';

@Injectable()
export class TasksService {
  private readonly tasks = new Map<string, Task>();

  create(dto: CreateTaskDto): Task {
    const task: Task = {
      id: randomUUID(),
      title: dto.title,
      description: dto.description ?? '',
      status: dto.status ?? TaskStatus.OPEN,
    };
    this.tasks.set(task.id, task);
    return { ...task };
  }

  findAll(): Task[] {
    return [...this.tasks.values()].map((task) => ({ ...task }));
  }

  findOne(id: string): Task {
    return { ...this.getOrThrow(id) };
  }

  update(id: string, dto: UpdateTaskDto): Task {
    const task = this.getOrThrow(id);
    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.status !== undefined) task.status = dto.status;
    return { ...task };
  }

  remove(id: string): void {
    this.getOrThrow(id);
    this.tasks.delete(id);
  }

  private getOrThrow(id: string): Task {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with id "${id}" not found`);
    }
    return task;
  }
}
