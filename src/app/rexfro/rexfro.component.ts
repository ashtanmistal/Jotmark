import {Component, Input} from '@angular/core';
import {Note} from "../note/note";
import {marked} from "marked";
import katex from "katex";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-rexfro',
  templateUrl: './rexfro.component.html',
  styleUrls: ['./rexfro.component.css']
})
export class RexfroComponent {

  @Input() notes: Note[] | null = null;
  find: string[] = [];
  replace: string[] = [];
  selectedNotes: Note[] = [];

  previewNote: Note | null = null;

  displayedColumns: string[] = ['find', 'replace'];

  constructor(private sanitizer: DomSanitizer) { }

  toggleNote(note: Note) {
    if (this.selectedNotes.includes(note)) {
      this.selectedNotes = this.selectedNotes.splice(this.selectedNotes.indexOf(note), 1);
    } else {
      this.selectedNotes.push(note);
    }
  }

  preview(note: Note) {
    this.previewNote = note;
  }

  parseAndRender(content: string) {
    // parse the content as Markdown
    let html = marked(content);

    // get $$ ... $$ equations
    html = html.replace(/\$\$([^]*?)\$\$/g, (match, p1) => {
      return katex.renderToString(p1, {displayMode: true});
    });
    html = html.replace(/\$([^]*?)\$/g, (match, p1) => {
      let newHtml = katex.renderToString(p1, {displayMode: false});
      return `${newHtml}`;
    });
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  rexfroNote(note: Note) {
    // applies every find and replace operation to the note that is passed in
    let content = note.content;
    for (let i = 0; i < this.find.length; i++) {
      content = content.replace(new RegExp(this.find[i], "g"), this.replace[i]);
    }
    return content;
  }

  apply() {
    // applies every find and replace operation to every selected note
    for (let note of this.selectedNotes) {
      note.content = this.rexfroNote(note);
    }

    // update this.notes to reflect the changes
    if (this.notes) {
      for (let i = 0; i < this.notes.length; i++) {
        if (this.selectedNotes.includes(this.notes[i])) {
          this.notes[i] = this.selectedNotes[this.selectedNotes.indexOf(this.notes[i])];
        }
      } // this is really inefficient, but it works for small numbers just fine so I won't bother optimizing it for now
      // TODO optimize this by storing a selected array of booleans instead of an array of notes
    }
  }

  addRow() {
    this.find.push("");
    this.replace.push("");
  }

  selectAll() {
    this.selectedNotes = this.notes ? this.notes.slice() : [];
  }

  deselectAll() {
    this.selectedNotes = [];
  }

  invertSelection() {
    if (this.notes) {
      this.selectedNotes = this.notes.filter(note => !this.selectedNotes.includes(note));
    }
  }
}
