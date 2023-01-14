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
    darkMode: false,
  };

  constructor() { }

  get(key: string) {
    return this._settings[key];
  }

  set(key: string, value: any) {
    // if it is dark mode, we have a special case
    if (key == 'darkMode') {
      if (value) {
        this._settings['themePrimary'] = "#3a3a3a";
        this._settings['themeAccent'] = "#2f0101";
        this._settings['themeTertiary'] = "#4f4f4f";
        this._settings['themeBackground'] = "#232323";
        this._settings['themeBackgroundAlt'] = "#1f1f1f";
        this._settings['themeText'] = "#ffffff";
        this._settings['themeSecondaryText'] = "#b7b7b7";

      } else {
        this._settings['themePrimary'] = "#d7d7d7";
        this._settings['themeAccent'] = "#2f0101";
        this._settings['themeTertiary'] = "#a1a1a1";
        this._settings['themeBackground'] = "#ffffff";
        this._settings['themeBackgroundAlt'] = "#f3f3f3";
        this._settings['themeText'] = "#000000";
        this._settings['themeSecondaryText'] = "#4f4f4f";
      }
    }
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
