import {Component, Input} from '@angular/core';
import {Note} from '../note/note';
import {ActivatedRoute} from "@angular/router";
import {marked} from "marked";
import katex from "katex";
import {DomSanitizer} from "@angular/platform-browser";
// import SimpleMDE from "simplemde";
import { Router } from '@angular/router';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent {
  // This class is an editor view for a single note.
  // It is a child of the AppComponent.
  // It has a note, which is a Note object.
  // the notes' content is a Markdown document.
  // we want to place a Markdown editor in this component, complete with a preview pane on the right hand side.
  // the editor should be able to save the note to a file.
  // the editor should have a panel on the left hand side that is the same as the GitHub markdown editor.
  @Input() note: Note | null = null;
  // editor: SimpleMDE | null = null;
  showNote = false;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer, private router: Router) {
    this.route.params.subscribe(params => {
      this.note = {name: params['name'], path: params['path'], tags: params['tags'], content: params['content'], external: params['external'], saved: params['saved'], lastModified: params['lastModified']};
      this.showNote = true;
    });
  }

  // ngOnInit() {
  //   // Initialize the SimpleMDE editor
  //   this.editor = new SimpleMDE({
  //     element: document.getElementById('editor') as HTMLTextAreaElement,
  //     spellChecker: true,
  //     toolbar: [
  //       "bold", "italic", "heading", "|",
  //       "quote", "unordered-list", "ordered-list", "|",
  //       "link", "image", "|"],
  //     status: true, // what does this do?
  //   });
  //   // pass the note's content to the editor
  //   if (this.note != null) {
  //     this.editor.value(this.note.content);
  //   }
  //   // on change, update the note's content
  //   this.editor.codemirror.on("change", () => {
  //     if (this.note != null && this.editor != null) {
  //       this.note.content = this.editor.value();
  //       this.note.saved = false;
  //     }
  //   });
  //   return this.editor;
  // }
  // SimpleMDE is not working
  // so we will just use a textarea for now

  parseAndRender(content: string) {
    // NOTE THIS IS THE SAME AS THE FUNCTION IN APP.COMPONENT.TS
    let html = marked(content);
    html = html.replace(/\$\$([^]*?)\$\$/g, (match, p1) => {
      return katex.renderToString(p1, {displayMode: true});
    });
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  closeEditor() {

    // dialog the user if they would like to name the note if it is named "Untitled"
    // if the note is named "Untitled", then the user should be prompted to name the note
    // if the note is not named "Untitled", then the user should not be prompted to name the note
    if (this.note != null && this.note.name === "Untitled") {
      // update the last modified time
      this.note.lastModified = Date.now();
      // prompt the user to name the note
      while(true) {
        const name = prompt("Please name your note."); // TODO make this a material design dialog
        if (name != null) {
          // check if the name is valid as a file name
          if (name.match(/^[a-zA-Z0-9_\-\.]+$/)) {
            this.note.name = name;
            break;
          } else {
            alert("Invalid file name.");
          }
          // TODO add an invisible character to the initialized note, and when a user rejects the prompt, delete the invisible character so that the user is not prompted again
        } else {
          // if the user rejects the prompt, then close the editor
          this.showNote = false;
          this.router.navigate(["/"]);
          return;
        }
      }
    }
    this.note = null;
    this.router.navigate(['/']);

    // TODO: making this null doesn't allow the user to re-open the same note immediately after closing it without double clicking; fix this
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
  }

  convertDate(lastModified: number) {
    // convert the last modified date to a string like "September 23, 2020 at 12:00 PM"
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
    // TODO make this a material design dialog
    let name = prompt("Please enter a new name for the note.", note.name);
    if (name != null) {
      // check if the name is valid as a file name
      if (name.match(/^[a-zA-Z0-9_\-\.]+$/)) {
        note.name = name;
      } else {
        alert("Invalid file name.");
      }
    }
  }
}
