async function addMimeChecks(table, mime, desc, audio) {
  var tr;

  var supportHardware = {
    supported: false
  };
  try {
    supportHardware = await (audio ? AudioEncoder : VideoEncoder).isConfigSupported({
      codec: mime,
      hardwareAcceleration: "prefer-hardware",
      width: audio ? null : 1920,
      height: audio ? null : 1080,
      bitrate: audio ? 128_000 : 2_000_000,
      numberOfChannels: audio ? 1 : null,
      sampleRate: audio ? 44100 : null
    });
  } catch (e) {
    supportHardware = {
      supported: false
    }
  }

  var supportSoftware = {
    supported: false
  };
  try {
    supportSoftware = await (audio ? AudioEncoder : VideoEncoder).isConfigSupported({
      codec: mime,
      hardwareAcceleration: "prefer-software",
      width: audio ? null : 1920,
      height: audio ? null : 1080,
      bitrate: audio ? 128_000 : 2_000_000,
      numberOfChannels: audio ? 1 : null,
      sampleRate: audio ? 44100 : null
    });
  } catch (e) {
    supportSoftware = {
      supported: false
    }
  }

  tr = document.createElement("tr");
  tr.innerHTML = "<td id='" + mime + "'>" + desc + "</td><td><a href='#" + mime + "'>" + mime + "</a></td><td class='" + (supportHardware.supported ? "ok" : "fail") + "'>" + (supportHardware.supported ? "yes" : "no") + "</td><td class='" + (supportSoftware.supported ? "ok" : "fail") + "'>" + (supportSoftware.supported ? "yes" : "no") + "</td>";
  table.appendChild(tr);
}

function createTableHeader(div) {
  var t = document.createElement("table");
  div.appendChild(t);
  var content = "";
  content += "<tr>";
  content += "<th>Description</th>";
  content += "<th>Codec</th>";
  content += "<th><code>prefer-hardware</code></th>";
  content += "<th><code>prefer-software</code></th>";
  content += "</tr>";
  t.innerHTML = content;
  return t;
}

function addParagraph(div, id, msg) {
  var p = document.createElement("p");
  p.setAttribute("id", id);
  p.innerHTML = msg;
  div.appendChild(p);
}

window.onload = async function () {
  var results = document.getElementById("results");
  var table, i;

  addParagraph(results, "audio_codecs", "Checking support for audio codecs with parameters");
  table = createTableHeader(results);
  for (i in AUDIO_CODECS) {
    var codec = AUDIO_CODECS[i].codec;
    await addMimeChecks(table, codec, AUDIO_CODECS[i].description, true);
  }
  addParagraph(results, "avc_codecs", "Checking support for AVC codecs with parameters");
  table = createTableHeader(results);
  addChecks(getAllAVCCodecs, addMimeChecks, table);

  addParagraph(results, "av1_codecs", "Checking support for AV1 codecs with parameters");
  table = createTableHeader(results);
  addChecks(getAllAV1Codecs, addMimeChecks, table);

  addParagraph(results, "other_video_codecs", "Checking support for other codecs such as VP9, HEVC");
  table = createTableHeader(results);
  addChecks(getAllVP9Codecs, addMimeChecks, table);
  addChecks(getAllHEVCCodecs, addMimeChecks, table);
};

async function addOwnTest(id, v) {
  var results = document.getElementById(id);
  results.innerHTML = '';
  table = createTableHeader(results);
  await addMimeChecks(table, v, "");
}

async function addChecks(getAllCodecs, add, table) {
  let codecs = getAllCodecs();
  for (i in codecs) {
    let e = codecs[i];
    await add(table, e.codec, e.description);
  }
}

