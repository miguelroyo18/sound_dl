## Table of contents

* [Introduction](#introduction)
* [Dependencies](#dependencies)
* [Setup](#setup)
* [Screenshots](#screenshots)

## Introduction

A GUI soundtrack downloader powered by [yt-dlp/yt-dlp](https://github.com/yt-dlp/yt-dlp).

## Dependencies

* Python (all of the requirements must be installed via `pip` in order to be able to run the API)
* Node
* [ffmpeg](https://www.ffmpeg.org)

## Setup

First of all, a build is not going to be provided. You must deploy the app in a way you find suitable.

To create an executable for the API run
```
pyinstaller sound_dl.spec
```
after moving to the api directory.

To create an executable for the program itself run
```
cd src
cd windows
npx react-native run-windows --release --arch x64
```
(providing that it is going to be executed on a x64 machine).

## Screenshots

![Full screen](/docs/screenshots/sound_dl-screenshot.bmp)