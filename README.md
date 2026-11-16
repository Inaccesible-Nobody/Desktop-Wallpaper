# Five Sides — vinyl desktop wallpaper

A minimal midnight-blue desktop wallpaper inspired by the supplied reference: five overlapping vinyl records on the left, with a fuzzy text clock, compact editable lined-paper to-do note, and a smaller calendar on the right.

## Run locally
1. Open this folder in VS Code.
2. Edit `playlists.js` and paste one Spotify playlist URL into each of the five slots.
3. Run `index.html` with VS Code Live Server.
4. Press `Alt+R` to unlock layout editing, then drag the records, clock, note, calendar, or Spotify player's `MOVE` tab. Press `Alt+R` again to lock the layout. Positions are saved in this browser. While unlocked, press `Alt+Q` to reset everything to its default position and lock the layout.
5. Click a record. It enlarges and becomes the active side; the Spotify player appears at the lower-left. Press `Shift+K` to hide or show it without unloading the player. If focus is inside the Spotify player, click outside it first before using the shortcut.
6. Click the active record again to stop/unload it. The to-do note is an editable multiline list: press Enter for the next ruled line. Its contents are saved in local browser storage.

## Spotify playback notes
Playback is initiated through Spotify's official Embed iframe API. The player can be hidden with `Shift+K` after playback starts; browser or Spotify restrictions may still require a visible sign-in, consent, or playback action. Actual playback can also depend on Spotify login and account/region restrictions. The page does not scrape Spotify artwork or metadata; the five vinyl label colours are part of the visual design. If you want your own artwork on the labels, replace the label contents in `index.html` with image elements and style them in `styles.css`.

## Lively Wallpaper
For local use, point Lively Wallpaper at this `index.html` (or the local Live Server URL while testing). For a shareable version, publish the folder to GitHub Pages and use the deployed page URL in Lively.
