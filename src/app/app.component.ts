import { Component } from '@angular/core';
import { Note } from './note/note';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Jotmark';
  notes: Note[] = [];
  sidenav: any;
  path: string = "";

  openPreferencesMenu() {
    this.sidenav.toggle();
    // TODO make a component for the Preferences menu

  }

  openHelpMenu() {
    this.sidenav.toggle();
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
          this.notes.push({name: file.name, content: text, external: true, saved: true});
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
        this.addMarkdownFile(input.files[i]);
      }
    });
    input.click();
  }

  newNote() {
    this.notes.push({name: "Untitled", content: "", external: false, saved: false});
    // TODO automatically open a new editor window with that note in it
  }

  saveSingleNote(Note: Note) {
    // save a single note
    // location to save to is this.path
    // we have already asserted it is not an empty string
    // if the file already exists, overwrite it
    if (this.path === "") {
      return;
    }
    let fs = require('fs');
    fs.writeFile(this.path + "/" + Note.name, Note.content, function (err: any) {
      if (err) {
        return console.log(err);
      }
      // file was saved successfully
    });
  }


  saveAllNotes() {
    // save all notes
    if (this.path === "") {
      this.saveAsAllNotes();
    } else {
      for (let i = 0; i < this.notes.length; i++) {
        this.saveSingleNote(this.notes[i]);
      }
    }
  }

  saveAsAllNotes() {
    // save the current directory to a temporary location
    const tempPath = this.path;
    // select a folder from the file system and save all notes there
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;

    input.addEventListener('change', () => {
      if (input.files == null) {
        return;
      }
      this.path = input.files[0].name;
    });
    input.click();

    // save all notes to the new directory
    if (this.path !== "") {
      this.saveAllNotes();
    } else {
      // throw an error
      alert("Error: could not save notes to new directory");
    }
  }

  clearNotes() {
    // check for unsaved notes
    for (let i = 0; i < this.notes.length; i++) {
      let unsaved = false;
      if (!this.notes[i].saved) {
        unsaved = true;
        break;
      }
      if (unsaved) {
        const userPrompt = confirm("You have unsaved notes. Would you like to save them?");
        if (userPrompt) {
          this.saveAllNotes();
        }
      }
    }
    // clear all notes
    const userPrompt = confirm("Are you sure you want to clear all notes?");
    if (userPrompt) {
      this.notes = [];
    }
  }

  undo() {
    // undo the last action
    // TODO: implement undo
  }

  redo() {
    // redo the last action
    // TODO: implement redo
  }

  cut() {
    // cut the selected text
    // TODO: implement cut
  }

  copy() {
    // copy the selected text
    // TODO: implement copy
  }

  paste() {
    // paste the selected text
    // TODO: implement paste
  }

  appearanceMenu() {
    // open the appearance menu
    // this is a subset of the Preferences menu
    // TODO: implement appearance menu -- do this once the Preferences menu is implemented
  }

  toggleFullScreen() {
    // toggle full screen mode
    // TODO implement full screen mode. We should probably make a settings.json file to store user preferences
  }

  refreshNotes() {
    // refresh the notes
    // TODO: implement refresh notes
  }
}
