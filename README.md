# The Listening Room — Desktop Wallpaper Prototype

A warm, vintage audio-room wallpaper prototype based on the supplied visual direction. The generated scene is used as the art layer, with functional interactive hit areas layered over the cassette tapes, lamp, ON AIR sign, note, clock, calendar and boombox.

## Run it in VS Code
1. Extract the project and open the `listening-room-wallpaper` folder in VS Code.
2. Open `index.html` with Live Server.
3. Add Spotify URLs in `playlists.js`, in order, one per cassette slot. Save and refresh.
4. Click a cassette, or drag it onto the boombox. The corresponding Spotify embed opens in a small player panel.
5. Click the pendant lamp to toggle warm ambient lighting.
6. Type into the blank sticky note. Its contents persist in the browser.

## Lively Wallpaper
Use the extracted folder as a web wallpaper in Lively. Keep `index.html`, `styles.css`, `app.js`, `playlists.js`, and the `assets` folder together. If publishing on GitHub Pages, publish the folder contents and use the resulting `index.html` URL in Lively.

## Important limitations
- The art is a single baked scene, so its illustrated objects are not individually animated. The interactive hit areas are layered over the artwork.
- Spotify's embed controls handle actual playback. The ON AIR indicator represents the wallpaper's selected/active player state, not verified Spotify playback state. Stopping unloads the embed.
- Playlist URLs are configured in `playlists.js`, not entered into a desktop dialogue. The note text uses browser local storage, so it is saved locally in the wallpaper browser context.
- The empty shelf is part of the artwork. Windows desktop icons must be arranged manually over it; a web wallpaper cannot move native desktop icons.
