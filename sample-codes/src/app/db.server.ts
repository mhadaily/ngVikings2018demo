import PouchDB from 'pouchdb';
import { Injectable } from '@angular/core';

@Injectable()
export class DbService {
  private pouch: any;
  constructor() {
    this.pouch = new PouchDB('ngVikings2018Demo');
  }
  // PouchDB.replicate('ngVikings2018Demo', 'http://remoteserver:5984/ngVikings2018Demo');
  // PouchDB.replicate('http://remote:5984/ngVikings2018Demo', 'ngVikings2018Demo');

  // PouchDB.sync('ngVikings2018Demo', 'http://remote:5984/ngVikings2018Demo');

  public addNote({ title, desc }): Promise<string> {
    return this.pouch
      .put({
        _id: ('note:' + (new Date()).getTime()),
        title,
        desc,
      })
      .then((result: any): string => result.id);
  }

  public getNotes(): Promise<{ _id: any, title: string, desc: string }[]> {
    return this.pouch
      .allDocs({
        include_docs: true,
        startkey: 'note:',
        endKey: 'note:\uffff'
      })
      .then(
        (result: any): any[] => {
          return result.rows.map(
            (row: any): any => ({
              id: row.doc._id,
              title: row.doc.title,
              desc: row.doc.desc,
            }));
        }
      );
  }
}
