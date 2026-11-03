// ============================================================================
// FUTURE SHARDS — ASSET LOADER FOR LOCAL PNG SPRITE LIBRARY
// Loads individual 32x32 and 128x128 PNG sprites + master transparent atlases
// ============================================================================

const AssetLibrary = {
  itemsAtlasImg: new Image(),
  sceneryAtlasImg: new Image(),
  itemImages32: {},
  itemImages128: {},
  sceneryImages32: {},
  sceneryImagesHd: {},
  buildingImages128: {},
  loadedCount: 0,
  totalToLoad: 0,

  init() {
    // Load the master 9x5 transparent PNG atlases directly from the asset folders
    this.itemsAtlasImg.src = `${ITEMS_BASE_DIR}/spritesheet_45_itens_transparente.png`;
    this.sceneryAtlasImg.src = `${SCENERY_BASE_DIR}/spritesheet_cenario_45_transparente.png`;

    // Preload all 45 item PNGs (32x32 and 128x128)
    ITEMS_DB.forEach(it => {
      const img32 = new Image();
      img32.src = it.sprite32;
      this.itemImages32[it.id] = img32;

      const img128 = new Image();
      img128.src = it.sprite128;
      this.itemImages128[it.id] = img128;
    });

    // Preload all 45 scenery/terrain/world object PNGs (32x32 and HD 128x128)
    SCENERY_ASSETS.forEach(sa => {
      const img32 = new Image();
      img32.src = sa.sprite32;
      this.sceneryImages32[sa.idx] = img32;

      const imgHd = new Image();
      imgHd.src = sa.sprite128;
      this.sceneryImagesHd[sa.idx] = imgHd;
    });

    // Preload all 9 building 128x128 PNGs
    BUILDINGS_DB.forEach(bld => {
      const imgBld = new Image();
      imgBld.src = bld.sprite128;
      this.buildingImages128[bld.id] = imgBld;
    });
  },

  // Returns the loaded Image object for a Scenery/Tile index (0..44)
  // Prefers HD 128x128 transparent PNG, falls back to 32x32 PNG
  getSceneryImage(sIdx) {
    const hd = this.sceneryImagesHd[sIdx];
    if (hd && hd.complete && hd.naturalWidth > 0) return hd;
    const sm = this.sceneryImages32[sIdx];
    if (sm && sm.complete && sm.naturalWidth > 0) return sm;
    return null;
  },

  // Returns the URL path for an Item sprite (small 32x32 or large 128x128)
  getItemSpriteUrl(itemId, small = false) {
    const it = ITEM_MAP[itemId];
    if (!it) return "";
    return small ? it.sprite32 : it.sprite128;
  },

  // Returns the URL path for a Scenery/World asset (0..44)
  getScenerySpriteUrl(sIdx, hd = true) {
    const sa = SCENERY_ASSETS[sIdx];
    if (!sa) return "";
    return hd ? sa.sprite128 : sa.sprite32;
  }
};

