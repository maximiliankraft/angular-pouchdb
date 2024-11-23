import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { map } from 'rxjs/operators';




export interface TodoItem {
  title: string;
  completed: boolean;
  createdAt: number;
  editing?: boolean;
}

export interface ToDoDocument extends PouchDB.Core.Document<TodoItem> {
}

export interface ExistingToDoDocument extends PouchDB.Core.ExistingDocument<TodoItem> {}

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private localDb: PouchDB.Database<ToDoDocument>;
  private remoteDb: PouchDB.Database<ToDoDocument>;
  private syncHandler: PouchDB.Replication.Sync<ToDoDocument>;
  
  todos$ = new BehaviorSubject<ExistingToDoDocument[]>([]);
  online$ = merge(
    of(navigator.onLine),
    fromEvent(window, 'online').pipe(map(() => true)),
    fromEvent(window, 'offline').pipe(map(() => false))
  );

  constructor() {
    this.localDb = new PouchDB('todos');
    this.remoteDb = new PouchDB('/couchdb/todos');

    
    this.syncHandler = this.startSync();
    
    this.online$.subscribe(online => {
      if (online) {
        this.syncHandler = this.startSync();
      } else {
        this.stopSync();
      }
    });

    this.loadTodos();
  }

  private async loadTodos() {
    try {
      const result = await this.localDb.allDocs({
        include_docs: true
      });
      const todos = result.rows.map(row => row.doc as ExistingToDoDocument);
      this.todos$.next(todos.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error('Error loading todos:', err);
    }
  }

  private startSync() {
    return this.localDb.sync(this.remoteDb, {
      live: true,
      retry: true
    }).on('change', () => {
      this.loadTodos();
    });
  }

  private stopSync() {
    if (this.syncHandler) {
      this.syncHandler.cancel();
    }
  }

  async addTodo(title: string) {
    const todo: ToDoDocument = {
      _id: new Date().toISOString(),
      title,
      completed: false,
      createdAt: Date.now()
    };

    try {
      await this.localDb.put(todo);
      this.loadTodos();
    } catch (err) {
      console.error('Error adding todo:', err);
    }
  }

  async updateTodo(todo: ToDoDocument) {
    try {
      await this.localDb.put(todo);
      this.loadTodos();
    } catch (err) {
      console.error('Error updating todo:', err);
    }
  }

  async deleteTodo(todo: ExistingToDoDocument) {
    try {
      if (todo._rev) {
        await this.localDb.remove(todo);
      } else {
        console.error('Error deleting todo: _rev is undefined');
      }
      this.loadTodos();
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  }
}