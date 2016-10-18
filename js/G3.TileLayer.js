
// G3.TileLayer(container, tiles, options)

G3.TileLayer = function (container, tiles, options) {
    this.lib = G3.lib;
    this.type = "G3.TileLayer";
    this.options = {
        tilesUpdatable: true,
        tilesRemovable: true,
        tiling: [-180, 84, 8, 8]
    }
    this.tiles = [];
    this.init(container, tiles, options);

}

G3.TileLayer.prototype.init = function (cont, ts, os) {
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

G3.TileLayer.prototype.validate = function () {
    if (!this.groupContainer) {
        console.warn("G3.TileLayer: container undefined");
        return false;
    }
    if (this.groupContainer.type == "Group" || this.groupContainer.type == "Scene") {
        return true;
    }
    console.warn("G3.TileLayer: container.type wrong");
    return false;
}

G3.TileLayer.prototype.setOptions = function (os) {
    os = os || {};
    this.options = Object.assign({}, this.options, os)
}

G3.TileLayer.prototype.requestTiles = function (ts) {
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

G3.TileLayer.prototype.requestTile = function (t) {
    if (t) {
        var that = this;
        var p = this.promiseTile(t)
                .then(
                        function (res) {
                            console.log("promise resolved");
                            that.putTile(res);
                        },
                        function (res) {
                            console.warn("G3.TileLayer.addTile failed", "(", res, ")");
                        }
                );
    }
}

G3.TileLayer.prototype.promiseTile = function (t) {
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

G3.TileLayer.prototype.putTile = function (t) {

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


