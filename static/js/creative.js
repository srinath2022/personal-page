(function () {
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function formatDate(d) {
    var parts = d.split('-');
    return MONTHS[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10) + ', ' + parts[0];
  }

  function esc(s) {
    var el = document.createElement('span');
    el.textContent = s;
    return el.innerHTML;
  }

  function buildExifStrip(cam) {
    var parts = [];
    if (cam.device) parts.push('<span class="exif-device">' + esc(cam.device) + '</span>');
    var fields = [];
    if (cam.lens) fields.push(cam.lens);
    if (cam.aperture) fields.push(cam.aperture);
    if (cam.shutter) fields.push(cam.shutter);
    if (cam.iso) fields.push('ISO ' + cam.iso);
    if (cam.focalLength) fields.push(cam.focalLength);
    if (cam.mode) fields.push(cam.mode);
    for (var i = 0; i < fields.length; i++) {
      parts.push('<span class="exif-sep">/</span>');
      parts.push('<span>' + esc(fields[i]) + '</span>');
    }
    return '<div class="journal-exif">' + parts.join('') + '</div>';
  }

  function buildPubCallout(pub) {
    var h = '<div class="journal-pub">';
    h += '<p class="journal-pub-label">Published</p>';
    if (pub.url) {
      h += '<a href="' + esc(pub.url) + '" target="_blank" rel="noopener" class="journal-pub-venue">' + esc(pub.venue) + '</a>';
    } else {
      h += '<span class="journal-pub-venue">' + esc(pub.venue) + '</span>';
    }
    if (pub.date) {
      h += ' <span class="journal-pub-date">' + formatDate(pub.date) + '</span>';
    }
    if (pub.screenshot) {
      h += '<img src="./static/images/creative/' + esc(pub.screenshot) + '" alt="Publication screenshot" class="journal-pub-screenshot" loading="lazy">';
    }
    h += '</div>';
    return h;
  }

  // ── ENTRIES ──
  // Add your photos here. Only title, photo, and story are required.
  // All other fields are optional — include what you have.
  var entries = [
    {
      id: "seagull-morro-rock",
      title: "The Seagull at Morro Rock",
      photo: "seagull.jpeg",
      story: "This one approached me looking for food while I was at Morro Rock during a solo Highway 1 drive. I offered some cherries, and in return, it struck a pose for the camera.",
      location: "Morro Rock, CA",
      trip: "Highway 1 Solo Drive"
    },
    {
      id: "rainbow-milpitas",
      title: "The Brightest Rainbow",
      photo: "rainbow.jpeg",
      story: "Spotted this accidentally after work in Milpitas. One of the brightest rainbows I've ever seen — all the colours were clearly visible. It lasted just a few minutes, and I managed to squeeze in 3-4 shots before the battery ran out.",
      location: "Milpitas, CA"
    },
    {
      id: "full-moon-milpitas",
      title: "Full Moon Over the Hills",
      photo: "moon.jpeg",
      story: "Captured during a full moon night near a school and the hills around Milpitas. Took some time figuring out the dynamics of low-light shots, especially for distant sky objects like the moon.\n\nEnded up using the lowest ISO, manual focus set to infinity, and varied the shutter speed across multiple shots to get the right exposure.",
      location: "Milpitas, CA",
      camera: {
        device: "DSLR",
        iso: "Lowest",
        shutter: "Varied",
        mode: "Manual Focus (Infinity)"
      }
    }
  ];

  function render() {
    var target = document.getElementById('creativeEntries');
    if (!target) return;

    if (entries.length === 0) {
      target.innerHTML = '<p style="color:var(--muted);font-size:0.95rem;text-align:center;padding:2rem 0;">Coming soon..</p>';
      return;
    }

    var html = '<div class="journal-grid">';
    for (var i = 0; i < entries.length; i++) {
      var e = entries[i];
      html += '<article class="journal-card"' + (e.id ? ' id="' + esc(e.id) + '"' : '') + '>';

      // Photo
      html += '<div class="journal-photo-wrap">';
      html += '<img src="./static/images/creative/' + esc(e.photo) + '" alt="' + esc(e.title) + '" class="journal-photo" loading="lazy">';
      html += '</div>';

      html += '<div class="journal-body">';

      // Title
      html += '<h2 class="journal-title">' + esc(e.title) + '</h2>';

      // Meta (date + location)
      var meta = [];
      if (e.date) meta.push('<span class="journal-date">' + formatDate(e.date) + '</span>');
      if (e.location) meta.push('<span class="journal-location">' + esc(e.location) + '</span>');
      if (meta.length) {
        html += '<div class="journal-meta">' + meta.join('<span class="journal-meta-sep">&middot;</span>') + '</div>';
      }

      // EXIF strip
      if (e.camera) {
        html += buildExifStrip(e.camera);
      }

      // Trip tag
      if (e.trip) {
        html += '<div class="journal-trip">' + esc(e.trip) + '</div>';
      }

      // Story
      html += '<div class="journal-story">';
      var paragraphs = e.story.split('\n\n');
      for (var p = 0; p < paragraphs.length; p++) {
        html += '<p>' + esc(paragraphs[p]) + '</p>';
      }
      html += '</div>';

      // Publication
      if (e.publication) {
        html += buildPubCallout(e.publication);
      }

      // Like button
      if (e.id) {
        html += '<div class="journal-like">';
        html += '<button class="like-btn" data-id="' + esc(e.id) + '" aria-label="Like">';
        html += '<svg class="like-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>';
        html += '<span class="like-count" data-id="' + esc(e.id) + '">0</span>';
        html += '</button>';
        html += '</div>';
      }

      html += '</div>'; // .journal-body
      html += '</article>';
    }
    html += '</div>'; // .journal-grid

    target.innerHTML = html;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
