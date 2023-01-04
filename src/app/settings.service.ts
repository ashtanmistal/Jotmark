import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settings: any = {
    editorFontSize: 8,
    editorFontFamily: "monospace",

    themePrimary: "#3f51b5",
    themeAccent: "#ff4081",
    themeTertiary: "#ff0000",
    themeBackground: "#32b623", /* main background */
    themeBackgroundAlt: "#18d5bf", /* a slightly darker background color for things like the editor */
    themeText: "#ffa400", /* text color for the editor and primary text */
    themeSecondaryText: "#5b2626", /* text color for secondary text (subtitles, etc) */

    previewFontSize: 8,
    previewFontFamily: "Roboto",
    defaultNoteColor: "#310d46",
  };

  constructor() { }

  get(key: string) {
    return this._settings[key];
  }

  set(key: string, value: any) {
    this._settings[key] = value;
  }

  export() {
    return this._settings;
  }

  import(settings: any) {
    /* TODO assert that the settings are valid */
    this._settings = settings;
  }
}
