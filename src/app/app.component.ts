import { Component } from '@angular/core';
import { OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Scavenger } from '@wishtack/rx-scavenger';
import { debounceTime, switchMap } from 'rxjs/operators';
import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import axios, { Axios } from 'axios';


@Component({
  selector: 'wt-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  boo = false;
  speech: string = '';
  voice = ''
  ngOnInit() {
  }
  constructor(private _ngZone: NgZone) {
  }
  getTranscript({ locale = 'en-US' }: { locale?: string } = {}): Observable<string> {

    return new Observable(observer => {
      const SpeechRecognition = window['webkitSpeechRecognition'];
      const speechRecognition = new SpeechRecognition();
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;
      speechRecognition.lang = locale;
      speechRecognition.onresult = (speechRecognitionEvent) => {
        var interim_transcript = '';
        for (var i = speechRecognitionEvent.resultIndex; i < speechRecognitionEvent.results.length; ++i) {
          if (speechRecognitionEvent.results[i].isFinal) {
            this.boo = true;
            this._ngZone.run(() => observer.next(speechRecognitionEvent.results[i][0].transcript.trim()));
          }
          else {
            this.boo = false;
            interim_transcript += speechRecognitionEvent.results[i][0].transcript;
            this._ngZone.run(() => observer.next(interim_transcript.trim()));
          }

        }
      };
      speechRecognition.start();

      return () => speechRecognition.abort();
    });
  }
  recognize() {
    this.getTranscript()
      .subscribe(transcript => {
        if (transcript !== '' && this.boo) {
          this.voice = this.voice + ' ' + transcript;
        }
        else {
          this.speech = transcript
        }
      });
    const res = Axios.call("https://libretranslate.com/translate", {
      method: "POST",
      body: JSON.stringify({
        q: this.speech,
        source: "en",
        target: "hi",
        format: "text",
        api_key: ""
      }),
      headers: { "Content-Type": "application/json" }
    });

    console.log('HINDI>>>>>>>>>>>>>>>>>>>>>>', res);
  }
  clearText() {
    this.voice = ''
    this.speech = ''
  }


  // Downloading Speech function
  expFile() {
    let csvContent = "data:text/csv;charset=utf-8," + this.voice;
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", 'Recorded_Speech' + ".txt");
    document.body.appendChild(link);
    link.click();
  }
}
