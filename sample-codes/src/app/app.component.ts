/**
 * This is just to demo some of the futures that can be done in an PWA in order to enhance user experience.
 */
import { Component, HostBinding, Renderer2 } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatSnackBar } from '@angular/material';
import { DbService } from './db.server';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public notes$: BehaviorSubject<{ title: string, desc: string }[]> = new BehaviorSubject([]);
  @HostBinding('class') componentCssClass;
  hidden: string;
  isEditing: boolean;
  visibilityChange: string;
  private NIGHT_MODE_THEME = 'black-theme';
  private LIGHT_MODE_THEME = 'light-theme';
  theme = this.LIGHT_MODE_THEME;
  stopListening1: any;
  stopListening2: any;
  stopListening3: any;
  stopListening4: any;
  deferredPromptEvent: any = null;
  addNoteFrom: FormGroup;

  constructor(
    private fb: FormBuilder,
    private overlayContainer: OverlayContainer,
    private db: DbService,
    private renderer: Renderer2,
    private snackBar: MatSnackBar,
  ) {

    this.addNoteFrom = this.fb.group({
      title: ['', Validators.required],
      desc: ['', Validators.required],
    });

    if (typeof (<any>document).hidden !== 'undefined') {
      this.hidden = 'hidden';
      this.visibilityChange = 'visibilitychange';
    } else if (typeof (<any>document).mozHidden !== 'undefined') {
      this.hidden = 'mozHidden';
      this.visibilityChange = 'mozvisibilitychange';
    } else if (typeof (<any>document).msHidden !== 'undefined') {
      this.hidden = 'msHidden';
      this.visibilityChange = 'msvisibilitychange';
    } else if (typeof (<any>document).webkitHidden !== 'undefined') {
      this.hidden = 'webkitHidden';
      this.visibilityChange = 'webkitvisibilitychange';
    } else {
      console.log('Page Visibility API not supported.');
    }

    const hours = new Date().getHours();
    if (hours >= 20 || hours <= 6) {
      this.setNightMode();
    } else {
      this.setLightMode();
    }

    renderer.listen('window', 'message', (e) => this.receiveMessage(e));
    this.stopListening1 = renderer.listen('window', 'online', (e) => this.backOnline(e));
    this.stopListening2 = renderer.listen('window', 'offline', (e) => this.goesOffline(e));
    this.stopListening3 = renderer.listen('window', 'beforeinstallprompt', (e) => this.deferredPrompt(e));
    this.stopListening4 = renderer.listen('window', this.visibilityChange, (e) => this.handleVisibilityChange());

    this.getData();
  }

  getData() {
    this.db.getNotes().then(result => {
      this.notes$.next(result);
    });
  }

  receiveMessage(event) {
    if (event.data.m) {
      this.snackBar.open(event.data.m, 'ok', { duration: 3000 });
      setTimeout(() => {
        this.setNightMode();
      }, 5000);
    }
    if (event.data.n) {
      this.snackBar.open(event.data.n, 'ok', { duration: 3000 });
      setTimeout(() => {
        this.setLightMode();
      }, 5000);
    }
  }

  handleVisibilityChange() {
    const timeBadge = new Date().toTimeString().split(' ')[0];
    console.log(`Page visibility changed to ${(document[this.hidden] ? 'hidden' : 'visible')} at ${timeBadge}`);
  }

  deferredPrompt(event) {
    event.preventDefault();
    this.deferredPromptEvent = event;
    return false;
  }

  async ShowDefferedPrompt() {
    if (this.deferredPromptEvent) {
      (<any>this.deferredPromptEvent).prompt();
      const choice = await (<any>this.deferredPromptEvent).userChoice;
      if (choice.outcome === 'dismissed') {
        console.log('installation was cancelled By User');
      } else {
        console.log('User added to home screen');
      }
      this.deferredPromptEvent = null;
    }
  }

  backOnline(e) {
    this.snackBar.dismiss();
    this.snackBar.open('Online!', 'Ok', { duration: 4000 });
    (document.querySelector('body') as any).style = '';
  }

  goesOffline(e) {
    this.snackBar.dismiss();
    this.snackBar.open('Offline!', 'Ok', { duration: 4000 });
    (document.querySelector('body') as any).style = 'filter: grayscale(1)';
  }

  removeClasslist() {
    const classList = this.overlayContainer.getContainerElement().classList;
    const toRemove = Array.from(classList).filter((item: string) =>
      item.includes('-theme')
    );
    classList.remove(...toRemove);
    return classList;
  }

  setNightMode() {
    this.componentCssClass = this.NIGHT_MODE_THEME;
    this.removeClasslist().add(this.NIGHT_MODE_THEME);
  }

  setLightMode() {
    this.componentCssClass = this.LIGHT_MODE_THEME;
    this.removeClasslist().add(this.LIGHT_MODE_THEME);
  }

  onSetting() {
    if (this.componentCssClass === 'light-theme') {
      this.setNightMode();
    } else {
      this.setLightMode();
    }
    this.vibrateSimple();
  }

  vibrateSimple() {
    // Simple for 200MS
    if ((<any>navigator).vibrate) {
      (<any>navigator).vibrate(200);
    }
  }

  vibratePattern() {
    // With Pattern
    if ((<any>navigator).vibrate) {
      (<any>navigator).vibrate([100, 200, 200, 200, 500]);
    }
  }

  registerTagSync(data) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      navigator.serviceWorker.ready
        .then((sw) => {
          // write to indexedDB
          this.db.addNote(data)
            .then(() => {
              this.snackBar.open('successfully saved to local db!', 'Ok', { duration: 1000 });
              // Register your tags
              return sw.sync.register('sync-notes');
            });
        });
    } else {
      console.log('SyncMnagaer is not supported and we need different Strategy');
    }
  }

  toggeladd() {
    this.isEditing = !this.isEditing;
  }

  addNote() {
    if (this.addNoteFrom.valid) {
      this.db
        .addNote(this.addNoteFrom.value)
        .then(() => this.ShowDefferedPrompt());
      this.getData();
      this.toggeladd();
    }
  }
}
