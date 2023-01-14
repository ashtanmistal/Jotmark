import { Component } from '@angular/core';
import {SettingsService} from "../service/settings.service";
import {MatDialog} from "@angular/material/dialog";
import {DialogComponent} from "../dialog/dialog.component";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  // NOTE that this is the UI for the settings, not the actual settings
  // The actual settings are stored in the settings service
  rawsettings: string = JSON.stringify(this.settings.export());
  constructor(private settings: SettingsService, private dialog: MatDialog) {
  }

  getSetting(key: string) {
    return this.settings.get(key);
  }

  setSetting(key: string, event: any) {
    this.settings.set(key, event.target.value);
  }

  exportSettings() {
    return JSON.stringify(this.settings.export());
  }

  saveSettings() {
    try {
      this.settings.import(JSON.parse(this.rawsettings));
    } catch (e) {
      this.dialog.open(DialogComponent, {
        data: {
          title: "Error",
          message: "Invalid settings file",
        }
      });
    }
  }

  setDarkMode(checked: boolean) {
    this.settings.set('darkMode', checked);
  }
}
