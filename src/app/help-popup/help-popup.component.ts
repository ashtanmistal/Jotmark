import { Component } from '@angular/core';

@Component({
  selector: 'app-help-popup',
  templateUrl: './help-popup.component.html',
  styleUrls: ['./help-popup.component.css']
})
export class HelpPopupComponent {

  openGithub() {
    // opens the github page in a new tab
    window.open('https://github.com/ashtanmistal/Jotmark', '_blank');
  }
}
