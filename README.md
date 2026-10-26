# Record Room — desktop wallpaper prototype

A no-build HTML/CSS/JavaScript desktop scene intended for local testing and Lively Wallpaper.

## Run it in VS Code

1. Extract `record-room-desktop.zip`.
2. Open the `record-room-desktop` folder in VS Code.
3. Open `index.html` in a browser, or use the VS Code **Live Server** extension.
4. Drag a vinyl sleeve from the wall onto the turntable. Clicking a record also loads it.
5. Use **add a record** to add a playlist. Paste a Spotify playlist URL to show Spotify's embedded playlist player.

## Use with Lively Wallpaper

Lively supports web wallpapers. For the first test, add the folder or `index.html` through Lively's wallpaper picker. If your installed Lively version expects a packaged file, follow its current import instructions.

## Current prototype features

- Draggable playlist sleeves and animated turntable vinyl
- Spotify playlist embed when a valid playlist URL is supplied
- Add records and save the collection in browser local storage
- Real-time clock and calendar
- Lamp toggle with warm ambience
- Editable reminder note
- Changeable Polaroid photo
- Daily coffee cup counter and undo
- Local-date reset for the coffee count, plus manual room tidy-up
- Dragonfly animation and reserved cactus stand

## Important limitations in this first pass

- Spotify's embed may require user interaction and an internet connection. The vinyl animation is not the audio engine.
- Browser storage is used for the prototype. Lively's storage behaviour should be tested on your PC before relying on it for long-term photo storage.
- The Polaroid upload is limited to 1.5 MB because this version stores the photo as browser data. A later version can use a local asset workflow.
- The cactus stand is a reserved visual area, not an integration with a separate virtual-pet app yet.
- The layout is designed primarily for a 16:9 desktop and has a mobile fallback for previewing.

## Project files

- `index.html` — scene structure and UI
- `styles.css` — layout, illustration styling, and animation
- `app.js` — interactions and local persistence

No npm install or build step is required.
