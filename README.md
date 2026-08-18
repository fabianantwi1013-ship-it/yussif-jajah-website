# Hon. Yussif Issaka Jajah, website

A cinematic multi-page site profiling the record and community work of
**Hon. Yussif Issaka Jajah**, Member of Parliament for Ayawaso North and Deputy
Minister for Tourism, Culture and Creative Arts.

No build step, no dependencies. Plain HTML, CSS and JavaScript.

## Running it

Because the pages load `assets/` and `images/` by relative path, open the site through
a web server rather than double-clicking a file:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Structure

```
index.html               cinematic landing page
about.html               Chapter 01, the man
record.html              Chapter 02, achievements
journey.html             Chapter 03, timeline
gallery.html             Chapter 04, photo gallery
constituency.html        Chapter 05, Ayawaso North
contact.html             Chapter 06, contact and form
assets/css/style.css     the whole design system
assets/js/gallery.js     the photo manifest, edit this to change the gallery
assets/js/site.js        shared engine: preloader, curtain transitions, overlay
                         menu, reveals, parallax, slideshow, timeline, counters,
                         gallery, lightbox, contact form
images/                  display images, max 1400px
images/thumbs/           small versions, max 620px, used in every grid
images/_originals/       untouched full-resolution downloads
```

Design notes: every page opens with a full-screen hero (slow Ken Burns zoom, masked
type reveal, film grain) and settles into calm content sections. Navigation between
pages runs through a curtain transition. The preloader appears once per browser
session, on the home page only. All motion respects `prefers-reduced-motion`.

## Turning the contact form on

The form currently opens the visitor's own email app, which does nothing on a phone
with no mail app configured. To make it deliver properly:

1. Go to <https://web3forms.com>
2. Enter the office email address; they email back an **Access Key**
3. Open `assets/js/site.js`, find `FORM_ACCESS_KEY` near the bottom, and paste it in:

```js
var FORM_ACCESS_KEY = 'your-key-here';
```

That is the only change needed. Submissions then arrive by email, with a spam trap and
proper success and failure messages already wired up. Until a key is set, the form
falls back to the mail app so it is never silently broken.

## Photographs

76 photographs were taken from the official Facebook page
(`facebook.com/YussifJajahForMP`), saved as `yj-01.jpg` through `yj-76.jpg`.

Every image exists in three forms: full resolution in `_originals/`, a 1400px display
version in `images/`, and a 620px version in `images/thumbs/`. Grids and cards load
the thumbnail; heroes and the gallery lightbox load the 1400px version. This keeps
each page's payload small, which matters for visitors on mobile data.

If you replace a photo, regenerate its thumbnail too, or the grids will keep showing
the old one.

Fixed slots use descriptive filenames that are copies of the originals:

| File | Used for |
|---|---|
| `hero-portrait.jpg` | home intro and About hero |
| `about-01/02/03.jpg` | the About page narrative |
| `record-*.jpg` | the six features on The Record |
| `community-01` to `04.jpg` | the Constituency page |

To swap any of these, overwrite the file; no code change needed. Any image that fails
to load falls back to a styled green-and-gold placeholder, not a broken-image icon.

To change the gallery, edit `assets/js/gallery.js`:

```js
{ src: 'images/yj-23.jpg', cat: 'ministry', title: 'Emancipation Day address',
  meta: 'Kwame Nkrumah Memorial Park' },
```

`cat` must be one of `ministry`, `office`, `events`, `constituency`; these drive the
filter buttons. Add a new category and a button appears automatically.

## Content still needed

**Photographs that do not exist in the Facebook album.** All 76 were checked:

- **The 135 youth groups donation**: there is no football, jersey or sports photo of
  any kind. `record-sports.jpg` currently shows an unrelated community gathering. It
  should be replaced with a real photo from the November 2024 distribution.
- **The drainage sod-cutting**: no photo of the ceremony itself. `record-drainage.jpg`
  uses `yj-70`, young men laying a concrete gutter in a narrow alley, which matches
  the work honestly but is not the sod-cutting event.

**Details still blank:**

- Constituency office street address and phone, placeholder on `contact.html`.

**Facts to verify:**

- Gallery captions were written from what is visible in each photo. Event names,
  dates and the people pictured need checking by someone who was there.
- Date of birth is deliberately omitted: Wikipedia gives 21 October 1979, Graphic
  Online gives 14 September 1966.
- Number of children: the Ministry profile says four, Wikipedia says two. The site
  says "married, with children" and takes no side.

## Content sources

- [Parliament of Ghana member profile](https://www.parliament.gh/members?mp=94025)
- [Ministry of Tourism, Culture & Creative Arts](https://www.motcca.gov.gh/about-us/management-team/yussif-issaka-jajah/)
- [GBC Ghana, drainage project sod-cutting](https://www.gbcghanaonline.com/news/mp-yussif-jajah-leads-sod-cutting-for-a-new-drainage-project-to-tackle-long-standing-flooding-in-ayawaso-north/2025/)
- [Metro TV, donation to 135 youth groups](https://metrotvonline.com/ayawaso-north-mp-yussif-jajah-donates-to-135-youth-groups-in-his-constituency/)
- [Wikipedia](https://en.wikipedia.org/wiki/Yussif_Issaka_Jajah)
