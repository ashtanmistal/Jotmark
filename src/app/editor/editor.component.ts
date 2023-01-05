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
  mobilePreview = false; // whether the user is viewing the editor or the preview on a mobile device

  constructor(private route: ActivatedRoute, private settings: SettingsService, private noteService: NoteService, private saveLoadService: SaveloadService) {
    this.route.params.subscribe(params => {
      this.note = {name: params['name'], path: params['path'], tags: params['tags'], content: params['content'], external: params['external'], saved: params['saved'], lastModified: params['lastModified'], images: params['images'], pinned: params['pinned']};
      this.showNote = true;
    });
  }

  parseAndRender(content: string) {
    return this.noteService.parseAndRender(content);
  }

  onTextAreaKeyDown() {
    if (this.note) {
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
    this.mobilePreview = !this.mobilePreview;
  }
}
