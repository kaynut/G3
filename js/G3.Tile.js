
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
