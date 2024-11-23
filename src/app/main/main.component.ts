import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DbService, ExistingToDoDocument, ToDoDocument, TodoItem } from '../services/db.service';

@Component({
  selector: 'app-main',
  imports: [CommonModule, FormsModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  todos$ = this.db.todos$;
  online$ = this.db.online$;
  showInstallPrompt = false;
  deferredPrompt: any;

  constructor(private db: DbService) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt = true;
    });
  }

  async promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this.showInstallPrompt = false;
      }
      this.deferredPrompt = null;
    }
  }

  addTodo(title: string) {
    if (title.trim()) {
      this.db.addTodo(title.trim());
    }
  }

  toggleTodo(todo: ToDoDocument) {
    this.db.updateTodo({ ...todo, completed: !todo.completed });
  }

  updateTodoTitle(todo: ToDoDocument, event: any) {
    const newTitle = event.target.value.trim();
    if (newTitle && newTitle !== todo.title) {
      this.db.updateTodo({ ...todo, title: newTitle });
    }
    todo.editing = false;
  }

  deleteTodo(todo: ExistingToDoDocument) {
    this.db.deleteTodo(todo);
  }
}
