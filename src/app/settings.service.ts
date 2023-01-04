import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private _settings: any = {
      editorFontSize: 16,
      editorFontFamily: "monospace",

      themePrimary: "#3f51b5",
      themeAccent: "#ff4081",
      themeBackground: "#fafafa", /* main background */
      themeBackgroundAlt: "#f5f5f5", /* a slightly darker background color for things like the editor */
      themeText: "#000000", /* text color for the editor and primary text */
      themeSecondaryText: "#757575", /* text color for secondary text (subtitles, etc) */

      previewFontSize: 16,
      previewFontFamily: "Roboto",
  };

  constructor() { }

  get(key: string) {
    console.log("getting key", key);
    console.log(this._settings.hasOwnProperty(key));
    console.log("getting test element");
    console.log(this._settings['editor.fontFamily']);
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
