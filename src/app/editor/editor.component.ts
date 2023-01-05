import {Component, Input} from '@angular/core';
import {Note} from '../note/note';
import {ActivatedRoute} from "@angular/router";
import { Router } from '@angular/router';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import FileSaver from "file-saver";
import {LatexService} from "../latex.service";
import {SettingsService} from "../settings.service";
import {NoteService} from "../note/note.service";

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @Input() note: Note | null = null;
  // editor: SimpleMDE | null = null;
  showNote = false;

  constructor(private route: ActivatedRoute, private router: Router, private converter: LatexService, private settings: SettingsService, private noteService: NoteService) {
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
      this.note.saved = false;
      this.note.lastModified = Date.now();
    }
  }

  convertDate(lastModified: number) {
    this.noteService.convertDate(lastModified);
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
    let Note = this.note;
    if (Note) {
      let blob = new Blob([Note.content], {type: "text/plain;charset=utf-8"});
      // if the note is external, save it in the same directory as the original
      FileSaver.saveAs(blob, Note.name + ".md");
    }
  }

  exportNoteAsLaTeX() {
    if (this.note) {
      let content = this.converter.convertToLatex(this.note.name, this.note.content, this.note.lastModified);
      let blob = new Blob([content], {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, this.note.name + ".tex");
    }
  }
  getSetting(key: string) {
    return this.settings.get(key);
  }
}
