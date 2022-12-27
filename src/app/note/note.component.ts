import {Component, EventEmitter, Input, Output} from '@angular/core';
import { Note } from './note';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.css']
})
export class NoteComponent {
  @Input() note: Note | null = null;
  @Output() noteChange = new EventEmitter<Note>();
}
