import { Injectable } from '@angular/core';
import {marked} from "marked";
import katex from "katex";
import {DomSanitizer} from "@angular/platform-browser";
import {MatDialog} from "@angular/material/dialog";
import {Note} from "./note";
import {DialogComponent} from "../dialog/dialog.component";

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  constructor(private sanitizer: DomSanitizer, private dialog: MatDialog) { }

  parseAndRender(content: string) {
    let html = marked(content);
    html = html.replace(/\$\$([^]*?)\$\$/g, (match, p1) => {
      return katex.renderToString(p1, {displayMode: true});
    });
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

  convertDate(lastModified: number) {
    const date = new Date(lastModified);
    const month = date.toLocaleString('default', {month: 'long'});
    const day = date.getDate();
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12;
    const minuteString = minute < 10 ? '0' + minute : minute;
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
}
