import { Component } from '@angular/core';
import { Note } from '../note/note';
import * as $ from 'jquery';

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
}
