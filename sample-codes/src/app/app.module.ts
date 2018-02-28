import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from './app.component';
import {
  MatButtonModule, MatToolbarModule,
  MatExpansionModule, MatCardModule,
  MatMenuModule, MatSelectModule,
  MatTabsModule, MatInputModule,
  MatProgressSpinnerModule, MatListModule,
  MatTooltipModule, MatIconModule, MatSidenavModule,
  MatButtonToggleModule, MatSnackBarModule
} from '@angular/material';

import { environment } from '../environments/environment';
import { DbService } from './db.server';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatButtonModule, MatToolbarModule,
    MatExpansionModule, MatCardModule,
    MatMenuModule, MatSelectModule,
    MatTabsModule, MatInputModule,
    MatProgressSpinnerModule, MatListModule,
    MatTooltipModule, MatIconModule,
    MatSidenavModule,
    FormsModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    DbService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
