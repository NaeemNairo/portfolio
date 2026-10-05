# Naeem · Research Portfolio

A fast, dependency-free personal website (plain HTML, CSS and JavaScript) built for GitHub Pages.

## Publish on GitHub Pages

1. Create a new public repository on GitHub. Name it `<your-username>.github.io` to get the address `https://<your-username>.github.io`. Any other name also works and gives `https://<your-username>.github.io/<repo-name>`.
2. Upload every file in this folder to the repository, keeping the folder structure (including the empty `.nojekyll` file).
3. In the repository, go to **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then click **Save**.
4. Your site will be live in a minute or two at the address shown on that page.

## Folder structure

```
index.html            All page content (edit text here)
assets/css/style.css  Colors, fonts and layout (colors are at the top, in :root)
assets/js/main.js     Menu, project filters, tabs and the interactive figures
assets/img/           Images (the current ones are placeholders)
.nojekyll             Tells GitHub Pages to serve the files as they are
```

## Things to replace

| What | Where |
|---|---|
| Your photo | Put `profile.jpg` in `assets/img/` and change `profile.svg` to `profile.jpg` in `index.html` |
| Project images | Replace the `.svg` files in `assets/img/`, or add `.jpg`/`.png` files and update each `<img src>`. Landscape 16:10 works best (e.g. 1280×800). |
| CV | Add `assets/cv.pdf` (the "Download CV" button points to it) |
| LinkedIn / GitHub / Scholar | Footer links in `index.html` (search for `href="#"`) |

## Editing tips

- **Add a project:** copy one `<article class="project">` block and set `data-category` to `prosthetics`, `controls`, `modeling` or `vision`. To add a new category, also add a matching filter button.
- **Add a skill:** add an `<li>` inside the relevant `skill-list`. To add a whole category, copy a `<article class="skill-card">`.
- **Change the accent color:** edit `--accent` and `--accent-soft` at the top of `style.css`.
