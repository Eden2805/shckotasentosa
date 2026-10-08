# Sacred Heart Church Kota Sentosa

A static parish website built with HTML, CSS, and JavaScript. Extract the ZIP,
then open `index.html` in a browser. No Node.js installation or build is needed.
Upload the contents of this folder to your static hosting provider to deploy.

## Project structure

- `index.html` — home, Mass schedule, about, and contact information.
- `church-tour.html` — Church Tour, labelled **Take a Tour** in every navigation bar.
- `course.html`, `funeral.html`, `priest.html`, `news.html` — existing parish pages.
- `styles.css`, `script.js` — shared layout and interactions.
- `church-tour.css` — responsive styles for the tour page.
- `church-tour.js` — interactive 3D illustration, controls, and highlight markers.
- `church-tour-config.js` — optional real 3D / 360° tour integration.
- `img/`, `news/`, `priest/` — existing images, kept at their original paths.

## Shared image headers

Home, Courses & Forms, News & Events, Church Tour, Meet Our Priests, and
Funeral Arrangements share an image-backed header with the church exterior
photograph, a dark overlay, a page title, an italic introduction, and a
page-specific action button. Each page marks its current navigation section
with `aria-current="page"` and a maroon underline.
The shared header rules are in `styles.css` under "Image Headers". Header
wording is editable in each HTML file. The navigation starts transparent over
these headers and becomes solid after scrolling.

## Church Tour content

The new page contains four infrastructure highlights, an interactive 3D
illustration, and an infrastructure history timeline. Highlight descriptions
and history entries are maintained directly in `church-tour.html`. The 3D
marker descriptions reuse the highlight text, so update it in one place.
Keep each highlight's ID and `data-highlight` value when editing.

The illustration is a simplified educational model, not a measured recreation
of the building or a real captured tour. Its dimensions, layout, and positions
are illustrative. It supports exterior and interior cutaway views, pointer
rotation, zoom, numbered markers, and reset. Keyboard users can focus the
canvas and use arrow keys, `+` / `-`, and `0` to reset. Mouse-wheel zoom works
when the canvas has focus; ordinary page scrolling is otherwise preserved.

No dated parish infrastructure records were included in the source package.
The history section therefore labels its unconfirmed entries as forthcoming.
Replace these entries with parish-approved construction dates, dedication
details, and renovation milestones before presenting them as historical facts.
The highlight photographs come from the existing website image collection.

## Connect a real 3D / 360° tour

1. Obtain the provider's HTTPS **embed URL** for the actual church tour.
2. Edit `church-tour-config.js` and set `embedUrl` to that URL.
3. Optionally set `publicUrl` to the public tour link for the new-tab button.
4. Reload `church-tour.html`. The captured tour replaces the illustration.

Use an embed URL supplied by the provider, rather than an editor or dashboard
URL. The provider must allow iframe embedding. If its embedded tour does not
load, visitors can use the accompanying new-tab link. An empty or invalid
embed URL keeps the interactive illustration visible. The website does not
upload scans or create a captured tour; a real tour must be captured separately.

## Deployment notes

Preserve relative paths and filename casing. The new module uses no external
JavaScript library and works locally. Existing Google Fonts, Font Awesome,
Google Maps, and external links require an internet connection. Git metadata
is excluded from this downloadable package. The Google registration form
continues to open in a new tab.

## Church Notices structure

Church notices in `news.html` use nested native dropdowns:

1. Each `notice-month` block represents one month and year.
2. Each month contains one or more `notice-week` blocks with a weekend date range.
3. Each week's `notice-list` contains all notices published in that weekly bulletin.

The latest month and week use the `open` attribute so visitors see current
notices immediately. Remove `open` from an older month when adding the next
month. Update the month's published-week count as weekly notices are added.

## Church CMS

The content file is `storage/content.json`. All site pages read it and retain
their original HTML if the CMS backend is unavailable. This package includes
two editing options: a visual PHP editor for XAMPP and Decap CMS with Git Gateway
for a Netlify site.

1. Extract the ZIP into `C:\xampp\htdocs`. It creates a `sacred` folder; you
   may rename that folder to `sacred-heart`. Start Apache in XAMPP.
2. Open `http://localhost/sacred/admin/` (or use `/sacred-heart/admin/` if you
   renamed the folder). Apache serves `admin/index.php` for the local editor.
3. On first use, create a username and a password with at least 12 characters.
4. Select a module and edit its fields. Expand or collapse content cards; add
   and remove controls manage list entries. **Advanced JSON** is available for
   bulk edits. Save changes to publish them locally.

The local editor requires PHP enabled in Apache. `storage/.htaccess` blocks
direct web access to the local admin password hash and content file. Use a
unique, strong admin password.

### Deploying the static website to Netlify

1. Unzip this package and locate the `sacred` folder. Its top level contains
   `index.html`.
2. In Netlify, use the drag-and-drop publisher and upload that `sacred` folder,
   or upload the separate `sacred-heart-netlify-ready.zip` package whose
   `index.html` is already at the ZIP root.
3. Netlify publishes the website and gives it a URL. To update a manual deploy,
   upload the updated `sacred` folder to that same site's Deploys page.

This static deploy cannot execute the PHP editor. The `/admin/` page is set up
to use Decap CMS when the site is connected to GitHub or GitLab and Netlify
Identity plus Git Gateway are enabled:

1. Put the extracted `sacred` folder in a GitHub repository and connect that
   repository to Netlify. Set the publish directory to the repository root if
   `index.html` is at the root, or `sacred` if the repository contains that
   folder one level down.
2. In Netlify, enable Identity and Git Gateway for the connected site, then
   invite your editor account.
3. Check `admin/config.yml` and change `branch: main` if your repository uses a
   different deployment branch.
4. Deploy. Sign in at `https://YOUR-SITE.netlify.app/admin/`. CMS edits are
   committed to the repository and Netlify redeploys the changed content.

A manual Netlify Drop publishes the public website but does not create the Git
repository or Git Gateway connection needed to save CMS edits. If `/admin/`
only shows the editor loading message after a Drop deployment, complete the
Git-connected setup above.

The static site reads the same public JSON file. The Netlify CMS is a Git-based
editor; the PHP editor remains for local XAMPP use.
The `.gitignore` excludes the local PHP admin password hash while keeping
`storage/content.json` available for Netlify CMS and the public pages.
