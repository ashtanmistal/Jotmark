import {Component, HostListener } from '@angular/core';
import {Note} from './service/note';
import {MatDialog} from "@angular/material/dialog";
import {DialogComponent} from "./dialog/dialog.component";
import { LatexService } from './service/latex.service';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {SettingsService} from "./service/settings.service";
import {NoteService} from "./service/note.service";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { environment } from "../environments/environment";
import {SaveloadService} from "./service/saveload.service";
// Initialize Firebase
const firebaseConfig = environment.firebaseConfig;
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

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
  sortParameter = "path";
  recentlyDeleted: Note[] = [];
  recentlyDeletedIndices: number[] = [];
  tagColors: any[] = [];
  defaultColor: string = "#ffffff";
  isDragging: boolean = false;
  pinnedNotes: Note[] = [];
  constructor(private dialog: MatDialog, private converter: LatexService, private settings: SettingsService, private noteservice: NoteService, private saveLoadService: SaveloadService) {}

  @HostListener('window:beforeunload', ['$event'])
  public beforeunloadHandler(event: any) {
    // check if any notes are unsaved
    for (let i = 0; i < this.notes.length; i++) {
      if (!this.notes[i].saved) {
        event.returnValue = "You have unsaved notes. Are you sure you want to leave?";
      }
    }
  }
  openPreferencesMenu() {
    // TODO make a component for the Preferences menu
    this.dialog.open(DialogComponent, {data: {type: "settings"}});
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
        let text = reader.result;
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
              // if the tag is not null
              if (tag !== "" && color !== "") {
                if (!this.totalTags.includes(tag)) {
                  this.totalTags.push(tag);
                  this.tagColors.push(color);
                }
                tags.push(tag);
              }
            }
            // get rid of the first line
            text = text.substring(text.indexOf("\n") + 1);
          }
          // this.notes.push({name: file.name.slice(0, -3), content: text, external: true, saved: true});
          this.notes.push({name: file.name.slice(0, -3), path: relativePath, tags: tags, content: text, external: true, saved: true, lastModified: file.lastModified, images: [], pinned: false});
          this.notes[this.notes.length - 1].saved = true;
        }
      }
      reader.readAsText(file);
    }
  }

  async openDirectory() {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;

    input.addEventListener('change', async () => {
      if (input.files == null) {
        return;
      }
      this.path = input.files[0].name;

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
    if (this.sortParameter != "path") {
      this.sortBy(this.sortParameter); // if another sorting method was selected then we want to sort the notes accordingly
    }
  }

  newNote() {
    // create a new service
    let name = "Untitled"; // adding an invisible character for prompt rejection and avoidance of re-prompts
    this.notes.push({name: name, path: "", tags: [], content: "", external: false, saved: false, lastModified: Date.now(), images: [], pinned: false});
    this.selectNote(this.notes[this.notes.length - 1]);
  }

  saveSingleNote(Note: Note) {
    this.saveLoadService.saveSingleNote(Note, this.tagColors, this.totalTags);
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

  selectNote(note: Note) {
    this.selectedNote = note;
    let output = this.dialog.open(DialogComponent, {
      data: { type: "editor", note: note, totalTags: this.totalTags, tagColors: this.tagColors, defaultColor: this.defaultColor }
    });
    output.afterClosed().subscribe(result => {
      if (result) {
        this.selectedNote = null;
        // this.selectedNote = result; // update the selected service just in case
      }
    });
  }

  parseAndRender(content: string) {
    // parse the content as Markdown
    return this.noteservice.parseAndRender(content);
  }

  handleNoteClick(note: Note) {
    if (!this.isDragging) {
      this.selectNote(note);
    }
  }

  removeTagFromNoteByIndex(note: Note, $event: MouseEvent, number: number) {
    // remove the tag from the service at the given index
    note.tags.splice(number, 1);
    note.saved = false;
    $event.stopPropagation(); // this prevents the service from being selected
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

  sortBy(sortParameter: string){
    // sort notes by given parameter
    // if parameter selected is already set, return to default order
    if (sortParameter == this.sortParameter) {
      this.notes.sort((note1, note2) => note1.path.localeCompare(note2.path));
      this.sortParameter = "path";
    } else {
      this.sortParameter = sortParameter;
      if(sortParameter == "last modified" ){
        this.notes.sort((note1, note2) => note2.lastModified - note1.lastModified);
      }
      if(sortParameter == "name"){
        this.notes.sort((note1,note2) => note1.name.localeCompare(note2.name));
      }
    }
  }



  addTagToNote(note: Note, tag: string) {
    // add a tag to the service at the given index
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
      data: { title: "Delete Note", message: "Are you sure you want to delete this service?", type: "confirm" }
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
    // get all the pinned notes - these should always be at the top
    let pinnedNotes = notes.filter(note => note.pinned);
    let unpinnedNotes = notes.filter(note => !note.pinned);
    notes = pinnedNotes.concat(unpinnedNotes);
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

  exportAllNotes() {
    this.saveLoadService.exportZip(this.notes, this.tagColors, this.totalTags);
  }

  exportLaTeX() {
    this.saveLoadService.exportLaTeX(this.notes);
  }

  dropTag(note: Note, $event: CdkDragDrop<string[], any>) {
    moveItemInArray(note.tags, $event.previousIndex, $event.currentIndex);
    note.saved = false;
  }

  pin(note: Note) {
    note.pinned = !note.pinned;
  }

  getSetting(key: string) {
    return this.settings.get(key);
  }
}
