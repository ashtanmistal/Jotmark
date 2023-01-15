import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatIconModule} from "@angular/material/icon";
import {MatCardModule} from "@angular/material/card";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EditorComponent } from './editor/editor.component';
import { SettingsComponent } from './settings/settings.component';
import {MarkdownModule} from "ngx-markdown";
import { AppRoutingModule } from './app-routing.module';
import {FormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatChipsModule} from "@angular/material/chips";
import {MatInputModule} from "@angular/material/input";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatListModule} from "@angular/material/list";
import {NgxColorsModule} from "ngx-colors";
import { DialogComponent } from './dialog/dialog.component';
import {MatDialogModule} from "@angular/material/dialog";
import {MatTableModule} from "@angular/material/table";
import {HttpClientModule} from "@angular/common/http";
import {CdkDrag, CdkDropList} from "@angular/cdk/drag-drop";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatTabsModule} from "@angular/material/tabs";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { HelpPopupComponent } from './help-popup/help-popup.component';


@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    SettingsComponent,
    DialogComponent,
    HelpPopupComponent,
  ],
  imports: [
    BrowserModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatCardModule,
    BrowserAnimationsModule,
    MarkdownModule,
    AppRoutingModule,
    FormsModule,
    MatFormFieldModule,
    MatChipsModule,
    MatInputModule,
    MatCheckboxModule,
    MatListModule,
    NgxColorsModule,
    MatDialogModule,
    MatTableModule,
    HttpClientModule,
    CdkDropList,
    CdkDrag,
    MarkdownModule.forRoot(),
    MatSidenavModule,
    MatTabsModule,
    MatGridListModule,
    MatSlideToggleModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
