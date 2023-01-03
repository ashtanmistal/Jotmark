import {Component} from '@angular/core';
import {Note} from './note/note';
import {marked} from 'marked';
import katex from 'katex';
import {DomSanitizer} from "@angular/platform-browser";
import {Router} from '@angular/router';
import { NgxColorsModule } from 'ngx-colors';
import FileSaver from 'file-saver';
import {MatDialog} from "@angular/material/dialog";
import {DialogComponent} from "./dialog/dialog.component";
import JSZip from "jszip";
import { HttpClient } from "@angular/common/http";
import { LatexService } from './latex.service';
import {CdkDragDrop, CdkDragEnd, CdkDragStart, moveItemInArray} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Jotmark';
  notes: Note[] = [];
  path: string = "";
  selectedNote: Note | null = null;
  totalTags: string[] = [];
  searchTerm: string = "";
  selectedTags: string[] = [];
  recentlyDeleted: Note[] = [];
  recentlyDeletedIndices: number[] = [];
  tagColors: any[] = [];
  defaultColor: string = "#ffffff";
  isDragging: boolean = false;
  constructor(private sanitizer: DomSanitizer, private router: Router, private dialog: MatDialog, private http: HttpClient, private converter: LatexService) {}

  openPreferencesMenu() {
    // TODO make a component for the Preferences menu

  }

  openHelpMenu() {
    // TODO: implement help menu
    // all this does is open a new window with the help menu
    // make a new window showing ../config/help.md
  }

  addMarkdownFile(file: File) {
    if (file.name.endsWith(".md")) {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result;
        if (typeof text === "string") {
          // how do I get the relative path of the file?
          let relativePath = file.webkitRelativePath;
          // cut until the first slash if it exists
          let tags = [];
          // look for tags on line 1 in the form of [//]: # (tags: tag1, color1; tag2, color2; ...)
          let firstLine = text.substring(0, text.indexOf("\n"));
          if (firstLine.startsWith("[//]: # (tags: ")) {
            let tagString = firstLine.substring("[//]: # (tags: ".length, firstLine.length - 1);
            let tagArray = tagString.split("; ");
            for (let i = 0; i < tagArray.length; i++) {
              let tag = tagArray[i].substring(0, tagArray[i].indexOf(", "));
              let color = tagArray[i].substring(tagArray[i].indexOf(", ") + 2);
              if (!this.totalTags.includes(tag)) {
                this.totalTags.push(tag);
                this.tagColors.push(color);
              }
              tags.push(tag);
            }
            // remove the first line
            text.substring(text.indexOf("\n") + 1);
          }
          // this.notes.push({name: file.name.slice(0, -3), content: text, external: true, saved: true});
          this.notes.push({name: file.name.slice(0, -3), path: relativePath, tags: tags, content: text, external: true, saved: true, lastModified: file.lastModified, images: []});
          this.notes[this.notes.length - 1].saved = true;
        }
      }
      reader.readAsText(file);
    }
  }

  openDirectory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;

    input.addEventListener('change', () => {
      if (input.files == null) {
        return;
      }
      this.path = input.files[0].name;
      // clear all notes that are external, i.e. from a different directory
      this.notes = this.notes.filter(note => !note.external);
      for (let i = 0; i < input.files.length; i++) {
        // add the markdown file
        this.addMarkdownFile(input.files[i]);
        let relativePath = input.files[i].webkitRelativePath;
        if (relativePath.indexOf("/") !== -1) {
          if (relativePath.indexOf("/") !== relativePath.lastIndexOf("/")) {
            let subDirectory = relativePath.substring(relativePath.indexOf("/") + 1, relativePath.slice(relativePath.indexOf("/") + 1).indexOf("/") + relativePath.indexOf("/") + 1);
            if (!this.totalTags.includes(subDirectory)) {
              this.totalTags.push(subDirectory);
              this.tagColors.push(this.defaultColor);
            }
          }
        }
      }
    });
    input.click();
  }

  newNote() {
    // create a new note
    let name = "Untitled"; // adding an invisible character for prompt rejection and avoidance of re-prompts
    this.notes.push({name: name, path: "", tags: [], content: "", external: false, saved: false, lastModified: Date.now(), images: []});
    this.selectNote(this.notes[this.notes.length - 1]);
  }

  saveSingleNote(Note: Note) {
    // save a single note
    // location to save to is this.path
    // we have already asserted it is not an empty string
    // if the file already exists, overwrite it
    if (this.path === "") {
      return;
    }
    // add the tags as a comment on line 1 in the form of [//]: # (tags: tag1, color1; tag2, color2; ...)
    let tags = "";
    for (let i = 0; i < Note.tags.length; i++) {
      tags += Note.tags[i] + ", " + this.tagColors[this.totalTags.indexOf(Note.tags[i])] + "; ";
    }
    // if note already begins with "[//]: # (tags: " then replace it
    while (Note.content.startsWith("[//]: # (tags: ")) { // this is a while loop because there may be multiple lines from previous saves that need to be fixed
      Note.content = Note.content.substring(Note.content.indexOf("\n") + 1);
    }
    let content = "[//]: # (tags: " + tags + ")\n" + Note.content;

    let blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    // if the note is external, save it in the same directory as the original
    FileSaver.saveAs(blob, Note.name + ".md");
  }


  saveAllNotes() {
      for (let i = 0; i < this.notes.length; i++) {
        if (!this.notes[i].saved) {
          this.saveSingleNote(this.notes[i]);
        }
      }
  }

  clearNotes() {
    // check for unsaved notes
    let unsaved = false;
    for (let i = 0; i < this.notes.length; i++) {
      if (!this.notes[i].saved) {
        unsaved = true;
        break;
      }
    }
    if (unsaved) {
      const userPrompt = this.dialog.open(DialogComponent, {
        data: { title: "Unsaved Notes", message: "You have unsaved notes. Are you sure you want to clear all notes?", type: "confirm" }
      });
      userPrompt.afterClosed().subscribe(result => {
        if (result) {
          this.notes = [];
        }
      });
    } else {
      this.notes = [];
    }
  }
  appearanceMenu() {
    // open the appearance menu
    // this is a subset of the Preferences menu
    // basically it opens the Preferences menu with the appearance tab selected, and that's it
    // TODO: implement appearance menu -- do this once the Preferences menu is implemented
  }

  toggleFullScreen() {
    // toggle full screen mode
    // TODO implement this function
    // pretty sure we can just have it write F11 or something simple like that
  }

  selectNote(note: Note) {
    this.selectedNote = note;
    // this.router.navigate(['/editor', this.selectedNote]).then(() => {});
    let output = this.dialog.open(DialogComponent, {
      data: { type: "editor", note: note }
    });
    output.afterClosed().subscribe(result => {
      if (result) {
        this.selectedNote = null;
        // this.selectedNote = result; // update the selected note just in case
      }
    });
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

  handleNoteClick(note: Note) {
    if (!this.isDragging) {
      this.selectNote(note);
    }
  }

  removeTagFromNoteByIndex(note: Note, $event: MouseEvent, number: number) {
    // remove the tag from the note at the given index
    note.tags.splice(number, 1);
    note.saved = false;
    $event.stopPropagation(); // this prevents the note from being selected
  }

  addNewTagToNote(note: Note) {
    const tag = this.dialog.open(DialogComponent, {
      data: { title: "Add Tag", message: "", type: "prompt" }
    });
    tag.afterClosed().subscribe(result => {
      if (result) {
        if (!this.totalTags.includes(result)) {
          this.totalTags.push(result);
          this.tagColors.push(this.defaultColor);
        }
        if (!note.tags.includes(result)) {
          note.tags.push(result);
          note.saved = false;
        }
      }
    });
}



  addTagToNote(note: Note, tag: string) {
    // add a tag to the note at the given index
    if (!note.tags.includes(tag)) {
      note.tags.push(tag);
      note.saved = false;
    }

  }

  filterByTag(tag: string) {
    // filter the notes by the given tag
    // if the tag is already selected, deselect it
    if (this.selectedTags.includes(tag)) {
      this.selectedTags.splice(this.selectedTags.indexOf(tag), 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  deleteNoteByIndex($event: MouseEvent, number: number) {
    const userPrompt = this.dialog.open(DialogComponent, {
      data: { title: "Delete Note", message: "Are you sure you want to delete this note?", type: "confirm" }
    });
    userPrompt.afterClosed().subscribe(result => {
      if (result) {
        this.recentlyDeleted.push(this.notes[number]);
        this.recentlyDeletedIndices.push(number);
        this.notes.splice(number, 1);
      }
    });
    $event.stopPropagation();
  }

  searchNotes(notes: Note[]) {
    // filter the notes by any tags selected
    // make a copy of the notes
    let filteredNotes = notes.slice();
    if (this.selectedTags.length !== 0) {
      for (let i = 0; i < filteredNotes.length; i++) {
        for (let j = 0; j < this.selectedTags.length; j++) {
          if (!filteredNotes[i].tags.includes(this.selectedTags[j])) {
            filteredNotes.splice(i, 1);
            i--;
            break;
          }
        }
      }
    }
    // search the notes for the given query in the title and content
    // query is this.searchTerm
    if (this.searchTerm === "") {
      return filteredNotes;
    } else {
      return filteredNotes.filter(note => {
        return note.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      });
    }
  }

  toggleTag(tag: string) {
    // toggle the given tag in the selectedTags array
    if (this.selectedTags.includes(tag)) {
      this.selectedTags.splice(this.selectedTags.indexOf(tag), 1);
    } else {
      this.selectedTags.push(tag);
    }
  }
  restoreDeleted(note: Note) {
    let index = this.recentlyDeleted.indexOf(note);
    // add to the notes array at the index
    this.notes.splice(this.recentlyDeletedIndices[index], 0, note);
    // remove from the recently deleted array
    this.recentlyDeleted.splice(index, 1);
    this.recentlyDeletedIndices.splice(index, 1);
  }

  deleteTag(tag: string) {
    for (let note of this.notes) {
      if (note.tags.includes(tag)) {
        note.tags.splice(note.tags.indexOf(tag), 1);
        note.saved = false;
      }
    }
    this.totalTags.splice(this.totalTags.indexOf(tag), 1);
    this.tagColors.splice(this.totalTags.indexOf(tag), 1);
  }

  changeTagColor(tag: string, color: any) {
    // change the color of the given tag
    this.tagColors[this.totalTags.indexOf(tag)] = color;
    for (let note of this.notes) {
      if (note.tags.includes(tag)) {
        note.saved = false;
      }
    }
  }

  clearRecentlyDeleted() {
    this.recentlyDeleted = [];
    this.recentlyDeletedIndices = [];
  }

  openRexfro(notes: Note[]) {
    let dialog = this.dialog.open(DialogComponent, {
      data: { type: "Rexfro", notes }
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.notes = result;
      }
    });
  }

  exportAllNotes() {
    // export all notes to a zip file
    let zip = new JSZip();
    for (let note of this.notes) {
      let tags = "";
      for (let i = 0; i < note.tags.length; i++) {
        tags += note.tags[i] + ", " + this.tagColors[this.totalTags.indexOf(note.tags[i])] + "; ";
      }
      // if note already begins with "[//]: # (tags: " then replace it
      while (note.content.startsWith("[//]: # (tags: ")) { // this is a while loop because there may be multiple lines from previous saves that need to be fixed
        note.content = note.content.substring(note.content.indexOf("\n") + 1);
      }
      let content = "[//]: # (tags: " + tags + ")\n" + note.content;
      console.log(note.path);
      zip.file(note.path, content);
    }
    zip.generateAsync({ type: "blob" }).then(content => {
      FileSaver.saveAs(content, "notes.zip");
    });
  }

  exportLaTeX() {
    // this should convert all notes to LaTeX and export them to a zip file
    let zip = new JSZip();
    for (let note of this.notes) {
      let content = this.converter.convertToLatex(note.name, note.content, note.lastModified);
      // remove the .md from the path
      let path = note.path.substring(0, note.path.length - 3) + ".tex";
      zip.file(path, content);
    }
    zip.generateAsync({ type: "blob" }).then(content => {
      FileSaver.saveAs(content, "notes-latex.zip");
    });
  }

  drop($event: CdkDragDrop<Note[], any>) {
    moveItemInArray(this.notes, $event.previousIndex, $event.currentIndex);
  }

  onDragEnd($event: CdkDragEnd) {
    this.isDragging = false;
  }

  onDragStart($event: CdkDragStart) {
    this.isDragging = true;
  }
}
