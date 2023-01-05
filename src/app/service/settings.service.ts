import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settings: any = {
    editorFontSize: 14,
    editorFontFamily: "monospace",

    themePrimary: "#d7d7d7",
    themeAccent: "#2f0101",
    themeTertiary: "#a1a1a1",
    themeBackground: "#ffffff", /* main background */
    themeBackgroundAlt: "#f3f3f3", /* a slightly darker background color for things like the editor */
    themeText: "#000000", /* text color for the editor and primary text */
    themeSecondaryText: "#4f4f4f", /* text color for secondary text (subtitles, etc) */

    previewFontSize: 16,
    previewFontFamily: "Roboto",
    defaultNoteColor: "#b7b7b7",
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
