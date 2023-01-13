import {Component, Input} from '@angular/core';
import {Note} from '../service/note';
import {ActivatedRoute} from "@angular/router";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {SettingsService} from "../service/settings.service";
import {NoteService} from "../service/note.service";
import {SaveloadService} from "../service/saveload.service";

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @Input() note: Note | null = null;
  showNote = false;
  showPreview = false; // whether the user is viewing the editor or the preview on a mobile device

  constructor(private route: ActivatedRoute, private settings: SettingsService, private noteService: NoteService, private saveLoadService: SaveloadService) {
    this.route.params.subscribe(params => {
      this.note = {name: params['name'], path: params['path'], tags: params['tags'], content: params['content'], external: params['external'], saved: params['saved'], lastModified: params['lastModified'], images: params['images'], pinned: params['pinned']};
      this.showNote = true;
    });
  }

  parseAndRender(content: string) {
    return this.noteService.parseAndRender(content);
  }

  onTextAreaKeyDown($event: KeyboardEvent) {
    if (this.note) {
      if ($event.key === 'Enter') {
        // indent the next line if the user presses enter according to the indent of the previous line
        const textArea = $event.target as HTMLTextAreaElement;
        const textAreaValue = textArea.value;
        const cursorPosition = textArea.selectionStart;
        const textBeforeCursor = textAreaValue.substring(0, cursorPosition);
        const textAfterCursor = textAreaValue.substring(cursorPosition);
        const linesBeforeCursor = textBeforeCursor.split('\n');
        const previousLine = linesBeforeCursor[linesBeforeCursor.length - 1];
        const spaces = previousLine.match(/^(\s*)/)?.[1];
        if (spaces) {
          textArea.value = textBeforeCursor + '\n' + spaces + textAfterCursor;
          textArea.selectionStart = cursorPosition + spaces.length + 1;
          textArea.selectionEnd = cursorPosition + spaces.length + 1;
          $event.preventDefault();
        }
      } else if ($event.key === 'Tab') {
        // indent the next line if the user presses tab
        const textArea = $event.target as HTMLTextAreaElement;
        const textAreaValue = textArea.value;
        const cursorPosition = textArea.selectionStart;
        const textBeforeCursor = textAreaValue.substring(0, cursorPosition);
        const textAfterCursor = textAreaValue.substring(cursorPosition);
        textArea.value = textBeforeCursor + '  ' + textAfterCursor;
        textArea.selectionStart = cursorPosition + 2;
        textArea.selectionEnd = cursorPosition + 2;
        $event.preventDefault();
      }
      this.note.saved = false;
      this.note.lastModified = Date.now();
    }
  }

  convertDate(lastModified: number) {
    return this.noteService.convertDate(lastModified);
  }

  editNoteName(note: Note) {
    this.noteService.editNoteName(note);
  }

  removeTagFromNoteByIndex(note: Note, $event: MouseEvent, number: number) {
    note.tags.splice(number, 1);
    note.saved = false;
    $event.stopPropagation();
  }

  dropTag($event: CdkDragDrop<string[], any>) {
    if (this.note) {
      moveItemInArray(this.note.tags, $event.previousIndex, $event.currentIndex);
      this.note.saved = false;
    }
  }

  saveNote() {
    if (this.note) {
      this.saveLoadService.saveSingleNote(this.note);
    }
  }

  exportNoteAsLaTeX() {
    if (this.note) {
      this.saveLoadService.saveNoteAsLatex(this.note);
    }
  }
  getSetting(key: string) {
    return this.settings.get(key);
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
  }
}
