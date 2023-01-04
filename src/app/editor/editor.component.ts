import {Component, Input} from '@angular/core';
import {Note} from '../note/note';
import {ActivatedRoute} from "@angular/router";
import {marked} from "marked";
import katex from "katex";
import {DomSanitizer} from "@angular/platform-browser";
import { Router } from '@angular/router';
import {MatDialog} from "@angular/material/dialog";
import {DialogComponent} from "../dialog/dialog.component";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import FileSaver from "file-saver";
import {LatexService} from "../latex.service";
import {SettingsService} from "../settings.service";

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  @Input() note: Note | null = null;
  // editor: SimpleMDE | null = null;
  showNote = false;
  totalTags: string[] = [];
  tagColors: any[] = [];
  defaultColor: string = "#ffffff";

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router, private dialog: MatDialog, private converter: LatexService, private settings: SettingsService) {
    this.route.params.subscribe(params => {
      this.note = {name: params['name'], path: params['path'], tags: params['tags'], content: params['content'], external: params['external'], saved: params['saved'], lastModified: params['lastModified'], images: params['images'], pinned: params['pinned']};
      this.showNote = true;
    });
  }

  parseAndRender(content: string) {
    // NOTE THIS IS THE SAME AS THE FUNCTION IN APP.COMPONENT.TS
    let html = marked(content);
    html = html.replace(/\$\$([^]*?)\$\$/g, (match, p1) => {
      return katex.renderToString(p1, {displayMode: true});
    });
    // for inline equations, include it in a div or something because it doesn't work otherwise
    try {
      html = html.replace(/\$([^]*?)\$/g, (match, p1) => {
        let newHtml = katex.renderToString(p1, {displayMode: false});
        return `${newHtml}`;
      });
    } catch (e) {
      console.log(e);
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  closeEditor() {
    if (this.note != null && this.note.name === "") { // if the note has no name
      // update the last modified time
      this.note.lastModified = Date.now();
      // prompt the user to name the note
        let userInput = this.dialog.open(DialogComponent, {
          data: { title: "Please name the note", message: "Untitled", type: "prompt" }
        });
        userInput.afterClosed().subscribe(name => {
          if (name != null && name !== "" && this.note != null) {
            // check if the name is valid as a file name
            if (name.match(/^[a-zA-Z0-9_\-\.]+$/)) {
              this.note.name = name;
              this.note.saved = false;
            } else {
              this.dialog.open(DialogComponent, {
                data: { title: "Invalid file name", message: "The file name you entered is invalid. Defaulting to Untitled.", type: "alert" }
              });
            }
          }
        });
    }
    this.note = null;
    this.router.navigate(['/']).then(() => {});
  }

  onEditorClick(event: MouseEvent) {
    // if the user clicks outside the editor, close the editor
    // let target = event.target as Element;
    // while (target != null) {
    //   if (target.id === "editor") {
    //     return;
    //   }
    //   target = target.parentElement as Element;
    // }
    // this.closeEditor();
    // TODO the above code is not working
    // Basically, I want to make it so that if the user clicks outside the editor, the editor closes. Nothing else.
  }

  onEditorKeyUp($event: KeyboardEvent) {
    // Here is where we would add actions corresponding to keyboard shortcuts that are not handled by the textarea
    // TODO implement this once keyboard shortcuts are implemented in the UI
    // if the user presses escape, close the editor
    if ($event.key === "Escape") {
      this.closeEditor();
    }
  }

  onTextAreaKeyDown($event: KeyboardEvent) {
    // TODO implement bold, italic, and other markdown related keyboard shortcuts
    // INCLUDING copy and paste
    // We need to implement something here if the user pastes images into the editor; it should create a new
    // image file and insert the image into the note using Markdown image syntax.
    if ($event.key === "v" && $event.ctrlKey || $event.key === "v" && $event.metaKey) {
      // TODO implement this
    } else if ($event.key === "b" && $event.ctrlKey || $event.key === "b" && $event.metaKey) {
      // get the selection range
      let selection = window.getSelection();
      if (selection != null) {
        let range = selection.getRangeAt(0);
        // insert the bold syntax
        range.insertNode(document.createTextNode("**"));
        range.collapse(false);
        range.insertNode(document.createTextNode("**"));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // just insert the bold syntax at the cursor position
        let textArea = document.getElementById("editor-textarea") as HTMLTextAreaElement;
        let startPos = textArea.selectionStart;
        let endPos = textArea.selectionEnd;
        textArea.value = textArea.value.substring(0, startPos) + "**" + textArea.value.substring(startPos, endPos) + "**" + textArea.value.substring(endPos, textArea.value.length);
        textArea.selectionStart = startPos + 2;
        textArea.selectionEnd = endPos + 2;
      }
    } else if ($event.key === "i" && $event.ctrlKey || $event.key === "i" && $event.metaKey) {
      // get the selection range
      let selection = window.getSelection();
      if (selection != null) {
        let range = selection.getRangeAt(0);
        // insert the italic syntax
        range.insertNode(document.createTextNode("*"));
        range.collapse(false);
        range.insertNode(document.createTextNode("*"));
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // just insert the italic syntax at the cursor position
        let textArea = document.getElementById("editor-textarea") as HTMLTextAreaElement;
        let startPos = textArea.selectionStart;
        let endPos = textArea.selectionEnd;
        textArea.value = textArea.value.substring(0, startPos) + "*" + textArea.value.substring(startPos, endPos) + "*" + textArea.value.substring(endPos, textArea.value.length);
        textArea.selectionStart = startPos + 1;
        textArea.selectionEnd = endPos + 1;
      }
    }
    if (this.note) {
      this.note.saved = false;
      this.note.lastModified = Date.now();
    }
  }

  convertDate(lastModified: number) {
    // convert the last modified date to a string like "September 23, 2020, at 12:00 PM"
    const date = new Date(lastModified);
    const month = date.toLocaleString('default', {month: 'long'});
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12;
    const minuteString = minute < 10 ? '0' + minute : minute;
    // if it was just modified, return "Just now"
    // if it was modified within a few minutes within the current time, return number of minutes ago
    // if it was modified within a few hours within the current time, return number of hours ago
    // else return the date
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diff / 60000);
    const diffHours = Math.floor(diff / 3600000);
    if (diffMinutes < 1) {
      return "Just now";
    } else if (diffHours < 1) {
      return diffMinutes + " minutes ago";
    } else if (diffHours < 24) {
      return diffHours + " hours ago";
    } else {
      return month + " " + day + ", " + year + " at " + hour12 + ":" + minuteString + " " + ampm;
    }
  }

  editNoteName(note: Note) {
    let userInput = this.dialog.open(DialogComponent, {
      data: { title: "Enter a new name for the note", message: note.name, type: "prompt" }
    });
    userInput.afterClosed().subscribe(name => {
    if (name != null) {
      // check if the name is valid as a file name
      if (name.match(/^[a-zA-Z0-9_ \-\.]+$/)) {
        if (name.length > 100) {
          this.dialog.open(DialogComponent, {
            data: { title: "Error", message: "The name of the note cannot be longer than 100 characters.", type: "alert" }
          });
        } else {
          note.name = name;
        }
      } else {
        // invalid file name
        this.dialog.open(DialogComponent, {
          data: { title: "Invalid file name", message: "The file name you entered is invalid.", type: "alert" }
        });
      }
    }
  });
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

  setSetting(key: string, value: any) {
    this.settings.set(key, value);
  }
}
