
// ----------------------------------------------------
// G3 - namespace
var G3 = G3 || {
    lib: {
        globeScale: 0.00001,
        imageSources: {
            black: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAAAAABX3VL4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAE0lEQVR42mJgYAAIIAYGBoAAAwAABgABfQjGZwAAAABJRU5ErkJggg==",
            error: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAAAAABX3VL4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAABGdBTUEAALGOfPtRkwAAACBjSFJNAAB6JQAAgIMAAPn/AACA6QAAdTAAAOpgAAA6mAAAF2+SX8VGAAAAE0lEQVR42mJgYAAIIAYGBoAAAwAABgABfQjGZwAAAABJRU5ErkJggg=="
        }

    },
    setLib: function (lib) {
        lib = lib || {};
        this.lib = Object.assign({}, this.lib, lib);
    }
};


// ----------------------------------------------------
// G3.GlobeTiles(container, tiles, options)
G3.GlobeTiles = function (container, tiles, options) {
    this.lib = G3.lib;
    this.type = "G3.GlobeTiles";
    this.options = {
        tilesUpdatable: true,
        tilesRemovable: true,
        tiling: [-180, 84, 8, 8]
    }
    this.tiles = [];
    this.init(container, tiles, options);

}

G3.GlobeTiles.prototype.init = function (cont, ts, os) {
    this.group = null;
    this.groupName = this.type;
    this.groupContainer = cont || null;
    this.tiles = [];

    // valid
    this.valid = this.validate();
    if (!this.valid) {
        return;
    }

    // options
    this.setOptions(os);


    // tiles
    this.requestTiles(ts);


}

G3.GlobeTiles.prototype.validate = function () {
    if (!this.groupContainer) {
        console.warn("G3.GlobeTiles: container undefined");
        return false;
    }
    if (this.groupContainer.type == "Group" || this.groupContainer.type == "Scene") {
        return true;
    }
    console.warn("G3.GlobeTiles: container.type wrong");
    return false;
}

G3.GlobeTiles.prototype.setOptions = function (os) {
    os = os || {};
    this.options = Object.assign({}, this.options, os)
}

G3.GlobeTiles.prototype.requestTiles = function (ts) {
    ts = ts || null;
    if (!ts) {
        return;
    }
    if (Array.isArray(ts)) {
        for (var t = 0; t < ts.length; t++) {
            this.requestTile(ts[t]);
        }
    } else {
        this.requestTile(ts);
    }
}

G3.GlobeTiles.prototype.requestTile = function (t) {
    if (t) {
        var that = this;
        var p = this.promiseTile(t)
                .then(
                        function (res) {
                            console.log("promise resolved");
                            that.putTile(res);
                        },
                        function (res) {
                            console.warn("G3.GlobeTiles.addTile failed", "(", res, ")");
                        }
                );
    }
}

G3.GlobeTiles.prototype.promiseTile = function (t) {
    var tiling = this.options.tiling;
    return new Promise(function (resolve, reject) {
        var nt = new G3.Tile(tiling);
        nt.onReady = function (res) {
            resolve(res);
        };
        nt.onError = function (res) {
            reject(res);
        }
        nt.loadTile(t);
    });
}

G3.GlobeTiles.prototype.putTile = function (t) {

    console.log(t.id);

    if (this.tiles[t.id] && !this.options.tilesUpdatable) {
        console.warn(this.type, "Tile already exists and tiles are not updatable");
    } else {
        this.tiles[t.id] = t;
    }


    console.dir(this.tiles);
}


/*
 tiles: [],

 addTo: function (container, tiles) {

 if(arguments.length<1) { return; }

 if(this.groupContainer === null) {
 this.groupContainer = container;
 }

 if(this.group === null) {
 this.group = new THREE.Group();
 this.group.name = this.groupName;
 this.groupContainer.add(this.group);
 }

 if(arguments.length>1) {
 this.addTiles(tiles);
 }
 },

 addTiles: function(tiles) { // allowed: ArrayOfTileObjects, SingleTileObject, ArrayOfTileUrls, SingleTileUrl
 if(typeof tiles === 'undefined') { return; }
 if(tiles instanceof Array) {
 for(var t=0;t<tiles.length; t++) {
 if(typeof tiles[t] === "string") {
 this.loadTilesUrl(tiles[t]);
 }
 else if(typeof tiles[t] === 'object') {
 this.addTile(tiles[t]);
 }
 }
 }
 else if(typeof tiles === 'object') {
 this.addTile(tiles);
 }
 else if(typeof tiles === "string") { // url to json, representing SingleTile OR ArrayOfTiles
 this.loadTilesUrl(tiles);
 }
 },

 loadTilesUrl: function(url) {
 var that = this;
 var req = new XMLHttpRequest();
 req.onreadystatechange = function() {
 if (this.readyState == 4 && this.status == 200) {
 var t = JSON.parse(this.responseText);
 that.addTiles(t);
 }
 };
 req.open("GET", url, true);
 req.send();

 },
 */



// ----------------------------------------------------
// G3.Tile(tiledefinition|tileurl)
G3.Tile = function (tiling) {
    this.lib = G3.lib;
    this.type = "G3.Tile";
    this.state = "init";

    this.id = null;
    this.area = null;
    this.data = null;
    this.tiling = tiling || [-180, 84, 8, 8];

}

// loadTile ( json | url pointing to json [> loadTile_fromUrl] )
G3.Tile.prototype.loadTile = function (t) {
    t = t || {};

    // param is url
    if (typeof t === "string") {
        this.loadTile_fromUrl(t);
        return;
    }

    // param is data
    this.area = t.area || null;
    this.data = t.data || {
        topo: {url: this.lib.imageSources.black},
        alti: {url: this.lib.imageSources.black, transform: [0, 1]}
    };
    if (typeof this.data.topo === "undefined") {
        this.data.topo = {url: this.lib.imageSources.black};
    }
    if (typeof this.data.alti === "undefined") {
        this.data.alti = {url: this.lib.imageSources.black, transform: [0, 1]};
    }
    if (typeof this.data.alti.transform === "undefined") {
        this.data.alti.transform = [0, 1];
    }

    // is valid and id
    this.valid = this.validate();
    if (this.valid.error) {
        this.state = "error";
        this.onError(this.valid.error);
        return;
    }
    this.id = this.valid.id;


    // count data.urls
    var numberOfImageSources = 0;
    for (var d in this.data) {
        if (this.data[d].url) {
            numberOfImageSources++;
        }
    }


    //  set state to numberOfDataUrls
    this.state = numberOfImageSources;


    // has imageSources
    if (this.state > 0) {
        for (var d in this.data) {
            if (this.data[d].url) {
                this.loadImageSources(this.data[d], this);
            }
        }
    }


    // has NO imageSources
    else {
        this.state = "ready";
        this.onReady(this);
    }


}
G3.Tile.prototype.loadTile_fromUrl = function (t) {
    var that = this;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function () {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var jt = JSON.parse(this.responseText);
                that.loadTile(jt);
            } else {
                that.onError("file " + this.status + ": " + t);
            }
        }
    };
    req.open("GET", t, true);
    req.send();
}
G3.Tile.prototype.validate = function () {
    if (!Array.isArray(this.tiling) || this.tiling.length < 4) {
        return {error: "tiling-info insufficient"};
    }
    if (!Array.isArray(this.area) || this.area.length < 4) {
        return {error: "area-info insufficient"};
    }

    if (this.tiling[2] != this.area[2] || this.tiling[3] != this.area[3]) {
        return {error: "tile-size and tiling-size are different"};
    }

    var r = (this.area[0] - this.tiling[0]) / this.area[2];
    var c = (this.tiling[1] - this.area[1]) / this.area[3] - 1;
    var s = 360 / this.area[2];

    if (r % 1 === 0 && c % 1 === 0) {
        return {id: r + c * s};
    }
    return {error: "tile does not fit in tiling"};
}
G3.Tile.prototype.loadImageSources = function (d, that) {
    d.img = new Image();
    // on success > decrement state, inform about progress
    d.img.onload = function () {
        that.state -= 1;
        that.onProgress();
    }
    // on error > set srcFailed, reset img.src to default error img.src
    d.img.onerror = function () {
        this.srcFailed = this.src;
        this.src = that.lib.imageSources.error;
    }
    d.img.src = d.url;
}

G3.Tile.prototype.onProgress = function () {
    if (this.state == "ready" || this.state == "error") {
        return;
    }
    if (this.state === 0) {
        this.state = "ready";
        this.onReady(this);
    }
}
G3.Tile.prototype.onReady = function (res) { }
G3.Tile.prototype.onError = function (error) { }



