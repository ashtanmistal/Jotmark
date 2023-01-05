import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Note} from "../service/note";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  note: Note | null = null;
  notes: Note[] | null = null;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DialogComponent>) {
    this.note = data.note;
  }

  closeDialog(answer: any) {
    this.dialogRef.close(answer);
  }

  // add a keyboard event listener to the dialog; if a user presses enter on a prompt or a confirm dialog, the dialog will close
  // ngOnInit() {
  //   document.addEventListener('keyup', (event) => {
  //     if (event.key === 'Enter' && this.data.type === 'confirm') {
  //       this.closeDialog(true);
  //     } else if (event.key === 'Enter' && this.data.type === 'prompt') {
  //       this.closeDialog(this.data.message);
  //     } else if (event.key === 'Enter' && this.data.type === 'alert') {
  //       this.closeDialog(null);
  //     }
  //   });
  // }

  confirmDialogKeyDown($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      this.closeDialog(true);
    }
  }

  promptDialogKeyDown($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      this.closeDialog(this.data.message);
    }
  }

  alertDialogKeyDown($event: KeyboardEvent) {
    if ($event.key === 'Enter') {
      this.closeDialog(null);
    }
  }
}
