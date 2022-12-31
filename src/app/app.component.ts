import {Component} from '@angular/core';
import {Note} from './note/note';
import {marked} from 'marked';
import katex from 'katex';
import {DomSanitizer} from "@angular/platform-browser";
import {Router} from '@angular/router';

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
  selectedNote: Note | null = null;
  totalTags: string[] = [];

  filteredNotes: Note[] = this.notes;
  constructor(private sanitizer: DomSanitizer, private router: Router) {}

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
          if (relativePath.indexOf("/") !== -1) {
            // find out if the note is in a subdirectory
            // if it is, add that subdirectory as a tag
            // do not add the file name itself as a tag
            if (relativePath.indexOf("/") !== relativePath.lastIndexOf("/")) {
              tags.push(relativePath.substring(0, relativePath.indexOf("/")));
            }
          }
          // this.notes.push({name: file.name.slice(0, -3), content: text, external: true, saved: true});
          this.notes.push({name: file.name.slice(0, -3), path: relativePath, tags: tags, content: text, external: true, saved: true, lastModified: file.lastModified});
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
        // for all immediate subdirectories, add them as tags. Do not add subdirectories of subdirectories
        // ignore the root directory. e.g. if I import the folder "Notes" with the subdirectories "Math" and "English", then
        // the tags will be "Math" and "English"
        if (input.files[i].webkitRelativePath.indexOf("/") !== -1) {
          // skip the root directory
          if (input.files[i].webkitRelativePath.indexOf("/") === input.files[i].webkitRelativePath.lastIndexOf("/")) {
            if (!this.totalTags.includes(input.files[i].webkitRelativePath.slice(0, input.files[i].webkitRelativePath.indexOf("/")))) {
              this.totalTags.push(input.files[i].webkitRelativePath.slice(0, input.files[i].webkitRelativePath.indexOf("/")));
            }
          }
        }
      }
    });
    input.click();
  }

  newNote() {
    this.notes.push({name: "Untitled", path: "", tags: [], content: "", external: false, saved: false, lastModified: Date.now()});
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
    // TODO implement saveSingleNote
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
    let unsaved = false;
    for (let i = 0; i < this.notes.length; i++) {
      if (!this.notes[i].saved) {
        unsaved = true;
        break;
      }
    }
    if (unsaved) {
      const userPrompt = confirm("You have unsaved notes. Would you like to save them?");
      // TODO change the confirm to be a material dialog and not a browser dialog
      if (userPrompt) {
        this.saveAllNotes();
      }
    }
    // clear all notes
    const userPrompt = confirm("Are you sure you want to clear all notes?");
    // TODO change the confirm to be a material dialog and not a browser dialog
    if (userPrompt) {
      this.notes = [];
    }
  }

  undo() {
    // undo the last action
    // TODO: implement undo IFF functionality does not already exist in the editor by default
  }

  redo() {
    // redo the last action
    // TODO: implement redo IFF functionality does not already exist in the editor by default
  }

  cut() {
    // cut the selected text
    // TODO: implement cut -- NOT a priority
  }

  copy() {
    // copy the selected text
    // TODO: implement copy -- NOT a priority
  }

  paste() {
    // paste the selected text
    // TODO: implement paste -- NOT a priority
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

  refreshNotes() {
    // refresh the notes
    // TODO: implement refresh notes -- I don't know if we even need this
    // if we remove it here we need to remove it from the menu as well
  }

  selectNote(note: Note) {
    this.selectedNote = note;
    this.router.navigate(['/editor', this.selectedNote]);
  }

  parseAndRender(content: string) {
    // parse the content as Markdown
    let html = marked(content);

    // get $$ ... $$ equations
    html = html.replace(/\$\$([^]*?)\$\$/g, (match, p1) => {
      return katex.renderToString(p1, {displayMode: true});
    });

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  deselectNote() {
    this.selectedNote = null;
    this.router.navigate(['/editor', this.selectedNote]); // should it be this, or just .navigate(['/'])?
  }

  handleNoteClick(note: Note, event: MouseEvent) {
    // if the user right clicked, open the context menu
    // if the user left clicked, select the note
    if (event.button === 0) {
      if (this.selectedNote === note) {
        this.deselectNote();
      } else {
        this.selectNote(note);
      }
    } else if (event.button === 2) {
      // TODO: implement context menu
    }

  }

  removeTagFromNoteByIndex(note: Note, $event: MouseEvent, number: number) {
    // remove the tag from the note at the given index
    note.tags.splice(number, 1);
    $event.stopPropagation(); // this prevents the note from being selected
  }

  openTagMenu(note: Note) {
    // open the tag menu

  }

  addNewTagToNote(note: Note) {
    // add a tag to the note and add it to the total tags if it is not already there
    // should prompt the user using a material design dialog
    // for now we will just use a browser prompt
    // TODO change the dialog to be a material dialog and not a browser dialog
    const tag = prompt("Enter a tag");
    if (tag != null) {
      if (!this.totalTags.includes(tag)) {
        this.totalTags.push(tag);
      }
      if (!note.tags.includes(tag)) {
        note.tags.push(tag);
      }
    }
  }

  addTagToNote(note: Note, tag: string) {
    // add a tag to the note at the given index
    if (!note.tags.includes(tag)) {
      note.tags.push(tag);
    }

  }

  filterByTag(tag: string) {
    // filter the notes by the given tag
    // TODO: implement filter by tag

  }

  deleteNoteByIndex($event: MouseEvent, number: number) {
    // delete the note at the given index
    // prompt the user to make sure they want to delete the note
    const userPrompt = confirm("Are you sure you want to delete this note?");
// TODO change the confirm to be a material dialog and not a browser dialog
    if (userPrompt) {
      this.notes.splice(number, 1);
    }
    $event.stopPropagation();
  }
}
