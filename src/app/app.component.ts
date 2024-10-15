import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { errors } from './constants'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Json Upload';
  message: string = '';
  name: string = '';
  age: number = 0;
  submitLoading: boolean = false;
  retrieveLoading: boolean = false;
  records: { name: string, age: number }[] = [];

  validateInputs(): boolean {
    if (!this.name || !this.age) {
      this.message = errors.nullValue;
      return false;
    }
    if (this.age <= 0 || this.age > 120) {
      this.message = errors.ageLimit;
      return false;
    }
    return true;
  }

  addEvent(): void {
    if (!this.validateInputs()) return;
    else {
      this.sendJson(this.name, this.age);
    }
  }

  getJson(): void {
    this.retrieveLoading = true;
    fetch('http://localhost:3000/retrieve-json-data')
      .then(response => response.json())
      .then(data => {
        this.records = data;
        this.retrieveLoading = false;
        this.message = 'Record added succesfully';
      })
      .catch(error => {
        this.retrieveLoading = false;
        console.error('Error:', error)
      });
  }

  sendJson(name: string, age: number): void {
    this.submitLoading = true;
    fetch('http://localhost:3000/upload-json-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        age: age,
      }),
    })
      .then(response => response.text())
      .then(data => {
        console.log(data);
        this.submitLoading = false;
      })
      .catch(error => {
        this.submitLoading = false;
        console.error('Error:', error)
      });
  }
}
