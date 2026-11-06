/* ============================================================
   South Florida record map — Leaflet + marker clustering
   Requires: leaflet, leaflet.markercluster, assets/people.js
   ============================================================ */
(function () {
  'use strict';

  function init() {
    var el = document.getElementById('map');
    if (!el || typeof L === 'undefined' || !window.PEOPLE) return;

    var SOUTH_FLORIDA = { south: 24.38, west: -82.97, north: 28.55, east: -79.97 };
    var bounds = [
      [SOUTH_FLORIDA.south, SOUTH_FLORIDA.west],
      [SOUTH_FLORIDA.north, SOUTH_FLORIDA.east]
    ];

    var map = L.map(el, {
      maxBounds: bounds,
      maxBoundsViscosity: 1.0,
      minZoom: 7,
      maxZoom: 18,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.fitBounds(bounds);

    /* Re-enable wheel zoom only after the user clicks the map,
       so the page keeps scrolling normally. */
    map.on('click', function () { map.scrollWheelZoom.enable(); });
    map.on('mouseout', function () { map.scrollWheelZoom.disable(); });

    /* ---------- Reference cities ---------- */
    var cities = [
      ['Miami', 25.7617, -80.1918],
      ['Fort Lauderdale', 26.1224, -80.1373],
      ['West Palm Beach', 26.7153, -80.0534],
      ['Boca Raton', 26.3683, -80.1289],
      ['Key West', 24.5551, -81.7800],
      ['Naples', 26.1423, -81.7948],
      ['Fort Myers', 26.6406, -81.8723]
    ];

    cities.forEach(function (c) {
      L.circleMarker([c[1], c[2]], {
        radius: 4.5,
        color: '#171827',
        weight: 1.6,
        fillColor: '#bde9d4',
        fillOpacity: 0.95
      }).addTo(map).bindTooltip(c[0], {
        permanent: true,
        direction: 'right',
        className: 'city-label',
        offset: [6, 0]
      });
    });

    /* ---------- Cluster layers ---------- */
    function clusterIcon(kind) {
      return function (cluster) {
        var n = cluster.getChildCount();
        var d = n < 10 ? 32 : n < 100 ? 40 : n < 1000 ? 48 : 56;
        return L.divIcon({
          html: '<div class="cluster-icon ' + kind + '" style="width:' + d +
                'px;height:' + d + 'px"><span>' + n + '</span></div>',
          className: '',
          iconSize: L.point(d, d)
        });
      };
    }

    var offenderLayer = L.markerClusterGroup({
      iconCreateFunction: clusterIcon('offender'),
      maxClusterRadius: 45,
      showCoverageOnHover: false,
      chunkedLoading: true
    });

    var predatorLayer = L.markerClusterGroup({
      iconCreateFunction: clusterIcon('predator'),
      maxClusterRadius: 45,
      showCoverageOnHover: false,
      chunkedLoading: true
    });

    /* ---------- Build markers ---------- */
    var records = [];
    var offenderCount = 0, predatorCount = 0, plottedCount = 0;

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    window.PEOPLE.forEach(function (row) {
      var id = row[0], name = row[1], desig = row[2],
          city = row[3], county = row[4], plotted = !!row[5],
          lat = row[6], lon = row[7];

      var rec = {
        id: id, name: name, designation: desig, city: city,
        county: county, plotted: plotted, lat: lat, lon: lon, marker: null
      };
      records.push(rec);

      if (desig === 'p') { predatorCount++; } else { offenderCount++; }
      if (!plotted) return;
      plottedCount++;

      var isPred = desig === 'p';
      var marker = L.marker([lat, lon], {
        title: name,
        icon: L.divIcon({
          className: 'person-marker ' + (isPred ? 'predator' : 'offender'),
          iconSize: [12, 12]
        })
      });

      var badge = isPred ? 'predator' : 'offender';
      marker.bindPopup(
        '<div class="pop-name">' + esc(name) + '</div>' +
        '<span class="pop-badge ' + badge + '">' + badge + '</span>' +
        '<div class="pop-row"><b>City:</b> ' + esc(city) + '</div>' +
        '<div class="pop-row"><b>County:</b> ' + esc(county) + ' County</div>' +
        '<div class="pop-id">Record ID: ' + esc(id) + '</div>'
      );

      rec.marker = marker;
      (isPred ? predatorLayer : offenderLayer).addLayer(marker);
    });

    map.addLayer(offenderLayer);
    map.addLayer(predatorLayer);

    /* ---------- Stats ---------- */
    function setText(id, val) {
      var n = document.getElementById(id);
      if (n) n.textContent = val;
    }
    setText('map-cnt-off', offenderCount.toLocaleString());
    setText('map-cnt-pred', predatorCount.toLocaleString());
    setText('map-cnt-shown', plottedCount.toLocaleString());

    var unplotted = records.length - plottedCount;
    setText('map-foot-note',
      records.length.toLocaleString() + ' records \u00b7 ' +
      plottedCount.toLocaleString() + ' plotted \u00b7 ' +
      unplotted.toLocaleString() + ' without coordinates');

    /* ---------- Layer toggles ---------- */
    var chkOff = document.getElementById('map-chk-off');
    var chkPred = document.getElementById('map-chk-pred');

    function syncLayers() {
      if (chkOff.checked) {
        if (!map.hasLayer(offenderLayer)) map.addLayer(offenderLayer);
      } else if (map.hasLayer(offenderLayer)) {
        map.removeLayer(offenderLayer);
      }

      if (chkPred.checked) {
        if (!map.hasLayer(predatorLayer)) map.addLayer(predatorLayer);
      } else if (map.hasLayer(predatorLayer)) {
        map.removeLayer(predatorLayer);
      }
    }

    if (chkOff) chkOff.addEventListener('change', syncLayers);
    if (chkPred) chkPred.addEventListener('change', syncLayers);

    /* ---------- Search ---------- */
    var searchEl = document.getElementById('map-search');
    var resultsEl = document.getElementById('map-results');

    function renderResults(q) {
      if (!resultsEl) return;
      q = (q || '').trim().toLowerCase();

      var list;
      if (!q) {
        list = records.filter(function (r) { return r.plotted; }).slice(0, 10);
      } else {
        list = records.filter(function (r) {
          return r.name.toLowerCase().indexOf(q) !== -1 ||
                 r.city.toLowerCase().indexOf(q) !== -1 ||
                 r.county.toLowerCase().indexOf(q) !== -1 ||
                 String(r.id).toLowerCase().indexOf(q) !== -1;
        }).slice(0, 60);
      }

      if (!list.length) {
        resultsEl.innerHTML = '<div class="map-no-results">No matching records.</div>';
        return;
      }

      resultsEl.innerHTML = list.map(function (r) {
        var cls = r.designation === 'p' ? 'p' : 'o';
        return '<div class="map-result ' + (r.plotted ? '' : 'unplotted') +
          '" data-id="' + esc(r.id) + '">' +
          '<span class="dot ' + cls + '"></span>' +
          '<span class="txt"><b>' + esc(r.name) + '</b>' +
          '<small>' + esc(r.city) + ', ' + esc(r.county) + ' County' +
          (r.plotted ? '' : ' \u00b7 no coordinates') + '</small></span></div>';
      }).join('');
    }

    if (resultsEl) {
      resultsEl.addEventListener('click', function (e) {
        var row = e.target.closest('.map-result');
        if (!row) return;

        var rec = null;
        for (var i = 0; i < records.length; i++) {
          if (String(records[i].id) === row.dataset.id) { rec = records[i]; break; }
        }
        if (!rec) return;

        if (!rec.plotted) {
          alert(rec.name + ' has no coordinates on record and cannot be plotted.');
          return;
        }

        var isPred = rec.designation === 'p';
        if (isPred && chkPred && !chkPred.checked) { chkPred.checked = true; syncLayers(); }
        if (!isPred && chkOff && !chkOff.checked) { chkOff.checked = true; syncLayers(); }

        map.flyTo([rec.lat, rec.lon], 16, { duration: 0.8 });
        var group = isPred ? predatorLayer : offenderLayer;
        group.zoomToShowLayer(rec.marker, function () { rec.marker.openPopup(); });
      });
    }

    var timer;
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { renderResults(searchEl.value); }, 120);
      });
    }

    renderResults('');

    /* Keep map sized correctly if the container was hidden at init */
    setTimeout(function () { map.invalidateSize(); }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
