"use client";

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, GithubAuthProvider, OAuthProvider } from 'firebase/auth';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAScGyvtc7nttn-9MkboB5G-tvuVSWEsnI",
  authDomain: "bhartiya-matkkka-pub.firebaseapp.com",
  projectId: "bhartiya-matkkka-pub",
  storageBucket: "bhartiya-matkkka-pub.appspot.com",
  messagingSenderId: "766901673732",
  appId: "1:766901673732:web:2b0a913504dcaed3687a51",
  databaseURL: "https://bhartiya-matkkka-pub.firebaseio.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export const twitterProvider = new TwitterAuthProvider();
export const githubProvider = new GithubAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');