import { Injectable } from '@angular/core';
import JSZip from "jszip";
import FileSaver from "file-saver";
import {LatexService} from "./latex.service";
import {Note} from "./note";

@Injectable({
  providedIn: 'root'
})
export class SaveloadService {

  constructor(private converter: LatexService) {
  }

  tagColors: string[] = [];
  totalTags: string[] = [];

  exportLaTeX(notes: Note[]) {
    // this should convert all notes to LaTeX and export them to a zip file
    let zip = new JSZip();
    for (let note of notes) {
      let content = this.converter.convertToLatex(note.name, note.content, note.lastModified);
      // remove the .md from the path
      let path = note.path.substring(0, note.path.length - 3) + ".tex";
      zip.file(path, content);
    }
    zip.generateAsync({type: "blob"}).then(content => {
      FileSaver.saveAs(content, "notes-latex.zip");
    });
  }

  exportZip(notes: Note[], tagColors: string[], totalTags: string[]) {
    this.tagColors = tagColors;
    this.totalTags = totalTags;
    // export all notes to a zip file
    let zip = new JSZip();
    for (let note of notes) {
      let tags = "";
      for (let i = 0; i < note.tags.length; i++) {
        tags += note.tags[i] + ", " + tagColors[totalTags.indexOf(note.tags[i])] + "; ";
      }
      // if service already begins with "[//]: # (tags: " then replace it
      while (note.content.startsWith("[//]: # (tags: ")) { // this is a while loop because there may be multiple lines from previous saves that need to be fixed
        note.content = note.content.substring(note.content.indexOf("\n") + 1);
      }
      let content = "[//]: # (tags: " + tags + ")\n" + note.content;
      zip.file(note.path, content);
    }
    zip.generateAsync({type: "blob"}).then(content => {
      FileSaver.saveAs(content, "notes.zip");
    });
  }

  saveSingleNote(Note: Note, tagColors?: string[], totalTags?: string[]) {
    if (tagColors && totalTags) {
      this.tagColors = tagColors;
      this.totalTags = totalTags;
    }
    let content: string;
    if (this.tagColors.length > 0 && this.totalTags.length > 0) {
      let tags = "";
      for (let i = 0; i < Note.tags.length; i++) {
        tags += Note.tags[i] + ", " + this.tagColors[this.totalTags.indexOf(Note.tags[i])] + "; ";
      }
      // if service already begins with "[//]: # (tags: " then replace it
      while (Note.content.startsWith("[//]: # (tags: ")) { // this is a while loop because there may be multiple lines from previous saves that need to be fixed
        Note.content = Note.content.substring(Note.content.indexOf("\n") + 1);
      }
      content = "[//]: # (tags: " + tags + ")\n" + Note.content;
    } else {
      content = Note.content;
    }
      let blob = new Blob([content], {type: "text/plain;charset=utf-8"});
      // if the service is external, save it in the same directory as the original
      FileSaver.saveAs(blob, Note.name + ".md");
  }

  saveNoteAsLatex(Note: Note) {
      let content = this.converter.convertToLatex(Note.name, Note.content, Note.lastModified);
      let blob = new Blob([content], {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, Note.name + ".tex");
  }
}
