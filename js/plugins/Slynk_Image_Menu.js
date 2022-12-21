//=============================================================================
// Slynk - Image Menu
// Slynk_Image_Menu.js
//=============================================================================

var Imported = Imported || {};
Imported.Slynk_Image_Menu = true;

var Slynk = Slynk || {};
Slynk.ImageMenu = Slynk.ImageMenu || {};

//=============================================================================
/*:
@plugindesc v1.0 A manageable item menu with pictures.
@author Slynk

@param ItemColumns
@desc How many columns?
@default 8

@param WindowWidthScale
@desc 1.0 is 100% width, .1 is 10% etc?
@default 0.5

@param WindowHeightScale
@desc 1.0 is 100% height, .1 is 10% etc?
@default 0.8

@param Padding
@desc How much padding?
@default 0.35

@param ShowItemCount
@desc Show how many items the player is carrying?
@default false

@param ShowItemNameBelow
@desc Show the item name below the item?
@default false

@param ShowItemNameWithDescription
@desc Show the item name along side the description?
@default false
*/

if(Imported.Slynk_Core_Menus) {
    var SelectorHeight = 36;
    var SelectorWidth = 36;

    Slynk.ImageMenu.ItemIconMenu = {};
    Slynk.ImageMenu.params = PluginManager.parameters('Slynk_Image_Menu');
    Slynk.ImageMenu.drawItemNumber = true;
    Slynk.ImageMenu.maxColumn = Number(Slynk.ImageMenu.params['ItemColumns'] || 8);
    Slynk.ImageMenu.windowWidthScale = Number(Slynk.ImageMenu.params['WindowWidthScale'] || 0.5);
    Slynk.ImageMenu.windowHeightScale = Number(Slynk.ImageMenu.params['WindowHeightScale'] || 0.8);
    Slynk.ImageMenu.iconPadding = Number(Slynk.ImageMenu.params['IconPadding'] || 0.35);
    Slynk.ImageMenu.showItemCount = Slynk.ImageMenu.params['ShowItemCount'].toLowerCase().trim() === 'true';
    Slynk.ImageMenu.showItemNameBelow = Slynk.ImageMenu.params['ShowItemNameBelow'].toLowerCase().trim() == 'true';
    Slynk.ImageMenu.showItemNameWithDescription = Slynk.ImageMenu.params['ShowItemNameWithDescription'].toLowerCase().trim() == 'true';

    //-----------------------------------------------------------------------------
    // Window_Help
    //
    // Override to make the help window scalable.

    Window_Help.prototype.initialize = function(numLines) {
        var width = Graphics.boxWidth * Slynk.ImageMenu.windowWidthScale;
        var height = this.fittingHeight(numLines || 2);
        var paddingX = (Graphics.boxWidth - width) / 2;

        // Calculate where the item window will be so we can move the help window appropriately
        var itemWindowHeight = (Graphics.boxHeight - height) * Slynk.ImageMenu.windowHeightScale;
        var paddingY = (Graphics.boxHeight - (itemWindowHeight + height)) / 2;


        Window_Base.prototype.initialize.call(this, paddingX, paddingY, width, height);
        this._text = '';
    };

    Window_Help.prototype.setItem = function(item) {

        if(item) {
            if(Slynk.ImageMenu.showItemNameWithDescription) {
                this.setText(item.name + ' -- ' + item.description);
            } else {
                this.setText(item.description);
            }
        } else {
            this.setText('');
        }

    };

    //-----------------------------------------------------------------------------
    // Scene_Item
    //
    // Override scene item to make an item only style view.
    Scene_Item.prototype.createItemWindow = function() {
        var wy = this._helpWindow.height;
        var wh = Graphics.boxHeight - wy;

        var drawWidth = Graphics.boxWidth * Slynk.ImageMenu.windowWidthScale;
        var drawHeight = wh * Slynk.ImageMenu.windowHeightScale;
        var paddingX = (Graphics.boxWidth - drawWidth) / 2;
        var paddingY = wy + ((Graphics.boxHeight  - (wy + drawHeight)) / 2);

        this._itemWindow = new Window_ItemList(paddingX, paddingY, drawWidth, drawHeight);
        this._itemWindow.setHelpWindow(this._helpWindow);
        this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
        this._itemWindow.setHandler('cancel', this.popScene.bind(this));
        this.addWindow(this._itemWindow);
        this._itemWindow.setCategory('keyItem');
        this.onCategoryOk();
    };

    Scene_Item.prototype.onItemOk = function() {
        // Store what item was selected
        $gameParty.setLastItem(this.item());

        // Save the background
        SceneManager.snapForBackground();

        // Push a command map on to the screen
        SceneManager.pushSimple({
            "Remove One": function () {
                var item = $gameParty.lastItem();
                $gameParty.loseItem(item, 1, true);

                SceneManager.pop();
            },

            "Remove All": function () {
                SceneManager.pushSimple({
                    "I'm sure!": function () {
                        var item = $gameParty.lastItem();
                        var count = $gameParty.numItems(item);

                        $gameParty.setLastItem(item);
                        $gameParty.loseItem(item, count, true);

                        SceneManager.pop();
                        SceneManager.pop();
                    },
                    'I CHANGED MY MIND!': function () {
                        SceneManager.pop();
                    }
                }, 'center');


            },
            "Cancel": function () {
                SceneManager.pop();
            }
        }, 'center');

    };

    Scene_Item.prototype.create = function() {
        Scene_ItemBase.prototype.create.call(this);
        this.createHelpWindow();
        this.createItemWindow();
        this.createActorWindow();
    };

    //-----------------------------------------------------------------------------
    // Window_ItemList
    //
    // Override scene item to make an item only style view.

    Window_ItemList.prototype.drawItem = function(index) {
        var item = this._data[index];
        if (item) {

            this.changePaintOpacity(this.isEnabled(item));

            this.resetTextColor();
            this.drawLargeIcon(item, index);

            var rect = this.itemRect(index);


            this.drawItemName(item, rect.x, rect.y, rect.width);

            if(Slynk.ImageMenu.showItemCount) {
                this.drawItemNumber(item, rect.x, rect.y, rect.width);
            }

            this.changePaintOpacity(1);
        }
    };

    Window_ItemList.prototype.drawItemName = function(item, x, y, width) {

        if(item && Slynk.ImageMenu.showItemNameBelow) {
            this.drawText(item.name, x, y+ (SelectorHeight - this.lineHeight()), width, 'center');
        }
    };

    Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
        if (this.needsNumber()) {
            this.drawText($gameParty.numItems(item), x, y, width, 'right');
        }
    };

    Window_ItemList.prototype.maxCols = function() {
        return Slynk.ImageMenu.maxColumn;
    };

    Window_ItemList.prototype.itemWidth = function() {
        return SelectorWidth;
    };

    Window_ItemList.prototype.itemHeight = function() {
        return SelectorHeight;
    };

    Window_ItemList.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var maxCols = this.maxCols();
        rect.width = this.itemWidth();
        rect.height = this.itemHeight();
        rect.x = index % maxCols * (rect.width) - this._scrollX;
        rect.y = Math.floor(index / maxCols) * rect.height - this._scrollY;
        return rect;
    };

    Window_ItemList.prototype.getPictureForItem = function (item) {
        if(!ImageManager.isReady()) {
            return null;
        }

        var lines = item.note.split(/[\r\n]+/);

        var path = "";
        for (var i = 0; i < lines.length; i++) {
            if (lines[i].match(/<(?:PICTURE):[ ](.*)>/i)) {
                path = String(RegExp.$1);
                break;
            }
        }

        if(path === "") {
            console.log("Can't load item picture: Path is null!");
            return null;
        }

        console.log("Image Path: %s", path);
        var bitmap = ImageManager.loadPicture(path, 0);
        if(!bitmap || bitmap._canvas.width == 1 || bitmap._canvas.height == 1) {
            console.log("Can't load item picture: Bitmap is null!");
            return null;
        }

        // Wait for bitmap to fully load
        while(!bitmap.isReady() && !bitmap.isError) {}
        if(bitmap.isError()) {
            console.log("Can't load item picture: Bitmap has an error!");
            return null;
        }

        return bitmap;
    };

    Window_ItemList.prototype.drawLargeIcon = function(item, drawIndex) {

        // Ensure we even have an image to draw
        var bitmap = this.getPictureForItem(item);
        if(!bitmap) {
            console.log("Can't load item picture: Bitmap is null!");
            return;
        }

        // Calculate how large the draw area is
        var totalUsableWidth = this.width - this.standardPadding() * 2;

        var drawColumn = drawIndex % this.maxCols();
        var drawRow = Math.floor(drawIndex / this.maxCols()) - this.topRow();

        var totalDrawWidth = totalUsableWidth  / this.maxCols();
        var totalDrawHeight = totalDrawWidth;

        SelectorWidth = totalDrawWidth;
        SelectorHeight = totalDrawHeight;

        // We want to save some room to display the cursor, so calculate some padding
        var PADDING = Slynk.ImageMenu.iconPadding;
        var paddingX = (totalDrawWidth * PADDING) / 2;
        var paddingY = (totalDrawHeight * PADDING) / 2;

        var drawWidth = totalDrawWidth - (paddingX * 2);
        var drawHeight = totalDrawHeight - (paddingY * 2);

        // Where should we draw the item
        var drawX = (totalDrawWidth * drawColumn) + paddingX;
        var drawY = (totalDrawHeight * drawRow ) + paddingY;

        // Load image from tags
        var pw = bitmap._canvas.width;
        var ph = bitmap._canvas.height;
        var sx = 0;
        var sy = 0;

        // Ready to draw
        console.log("Drawing item %d, aka %s, to (%d, %d) via row column (%d, %d)", drawIndex, item.name, drawX, drawY, drawRow, drawColumn);
        this.contents._context.imageSmoothingEnabled = false;
        this.contents.blt(bitmap, sx, sy, pw, ph, drawX, drawY, drawWidth, drawHeight);
        this.contents._context.imageSmoothingEnabled = true;
    };

} else {
    console.error('Slynk Image Menu -- To use this plugin, you must enable Slynk Core Menus');
}