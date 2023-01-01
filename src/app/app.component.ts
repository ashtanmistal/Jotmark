import {Component} from '@angular/core';
import {Note} from './note/note';
import {marked} from 'marked';
import katex from 'katex';
import {DomSanitizer} from "@angular/platform-browser";
import {Router} from '@angular/router';
import { NgxColorsModule } from 'ngx-colors';

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
              tags.push(relativePath.substring(relativePath.indexOf("/") + 1, relativePath.slice(relativePath.indexOf("/") + 1).indexOf("/") + relativePath.indexOf("/") + 1)); // add the subdirectory as a tag
            }
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
        // for all immediate subdirectories, add them as tags. Do not add subdirectories of subdirectories
        // ignore the root directory. e.g. if I import the folder "Notes" with the subdirectories "Math" and "English", then
        // the tags will be "Math" and "English"
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

  selectNote(note: Note) {
    this.selectedNote = note;
    this.router.navigate(['/editor', this.selectedNote]).then(() => {});
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

  deselectNote() {
    this.selectedNote = null;
    this.router.navigate(['/editor', this.selectedNote]).then(() => {}); // should it be this, or just .navigate(['/'])?
  }

  handleNoteClick(note: Note, event: MouseEvent) {
    // if the user right-clicked, open the context menu
    // if the user left-clicked, select the note
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

  addNewTagToNote(note: Note) {
    // add a tag to the note and add it to the total tags if it is not already there
    // should prompt the user using a material design dialog
    // for now we will just use a browser prompt
    // TODO change the dialog to be a material dialog and not a browser dialog
    const tag = prompt("Enter a tag");
    if (tag != null) {
      if (!this.totalTags.includes(tag)) {
        this.totalTags.push(tag);
        this.tagColors.push(this.defaultColor);
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
    // if the tag is already selected, deselect it
    if (this.selectedTags.includes(tag)) {
      this.selectedTags.splice(this.selectedTags.indexOf(tag), 1);
    } else {
      this.selectedTags.push(tag);
    }
  }

  deleteNoteByIndex($event: MouseEvent, number: number) {
    // delete the note at the given index
    // prompt the user to make sure they want to delete the note
    const userPrompt = confirm("Are you sure you want to delete this note?");
// TODO change the confirm to be a material dialog and not a browser dialog
    if (userPrompt) {
      // add the note to recently deleted
      this.recentlyDeleted.push(this.notes[number]);
      this.recentlyDeletedIndices.push(number);
      this.notes.splice(number, 1);
    }
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
      note.tags.splice(note.tags.indexOf(tag), 1);
    }
    this.totalTags.splice(this.totalTags.indexOf(tag), 1);
    this.tagColors.splice(this.totalTags.indexOf(tag), 1);
  }

  changeTagColor(tag: string, color: any) {
    // change the color of the given tag
    this.tagColors[this.totalTags.indexOf(tag)] = color;
  }
}
